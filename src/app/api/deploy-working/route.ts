import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Website from '@/models/Website';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { websiteId } = await request.json();
    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const website = await Website.findOne({ _id: websiteId, userId });
    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      return NextResponse.json(
        { error: 'Vercel token not configured' },
        { status: 500 }
      );
    }

    console.log('🌐 Creating working deployment for:', website.title);

    // Deploy to Vercel with proper configuration
    const deploymentResult = await deployToVercel(website, vercelToken);

    if (deploymentResult.success) {
      website.deploymentUrl = deploymentResult.url;
      website.deploymentId = deploymentResult.deploymentId;
      website.deploymentStatus = 'deployed';
      await website.save();

      return NextResponse.json({
        success: true,
        url: deploymentResult.url,
        deploymentId: deploymentResult.deploymentId,
        message: `🎉 Website deployed successfully!`
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: deploymentResult.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Deploy error:', error);
    return NextResponse.json(
      {
        error: 'Deployment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function deployToVercel(website: any, vercelToken: string) {
  try {
    const safeName = website.slug.replace(/[^a-z0-9-]/g, '-').toLowerCase();
    const files = generateFiles(website);

    const deploymentFiles = Object.entries(files).map(([path, content]) => {
      let stringContent: string;
      if (typeof content === 'string') {
        stringContent = content;
      } else {
        stringContent = JSON.stringify(content, null, 2);
      }

      console.log(`📄 File ${path}: ${stringContent.length} characters`);

      const cleanContent = stringContent
        .replace(/\0/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');

      const base64Data = Buffer.from(cleanContent, 'utf8').toString('base64');

      console.log(
        `✅ ${path}: ${cleanContent.length} chars -> ${base64Data.length} base64 chars`
      );

      return {
        file: path,
        data: base64Data,
        encoding: 'base64'
      };
    });

    const deploymentPayload = {
      name: safeName,
      files: deploymentFiles,
      projectSettings: {
        framework: 'nextjs',
        buildCommand: 'pnpm build',
        devCommand: 'pnpm dev',
        outputDirectory: '.next'
      },
      target: 'production'
    };

    console.log('📋 Deployment payload:', {
      name: deploymentPayload.name,
      filesCount: deploymentPayload.files.length,
      files: deploymentPayload.files.map((f) => ({
        file: f.file,
        encoding: f.encoding,
        dataLength: f.data.length
      }))
    });

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deploymentPayload)
    });

    const deployment = await response.json();

    if (!response.ok) {
      console.error('❌ Vercel API error:', {
        status: response.status,
        statusText: response.statusText,
        error: deployment
      });

      return {
        success: false,
        error:
          deployment.error?.message ||
          deployment.message ||
          `HTTP ${response.status}: ${response.statusText}`
      };
    }

    console.log('✅ Deployment created successfully');
    console.log('🔗 Deployment info:', {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState
    });

    if (deployment.readyState === 'READY') {
      const finalUrl = `https://${deployment.url}`;
      return {
        success: true,
        url: finalUrl,
        deploymentId: deployment.id
      };
    }

    let attempts = 0;
    const maxAttempts = 24;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        const statusResponse = await fetch(
          `https://api.vercel.com/v13/deployments/${deployment.id}`,
          {
            headers: {
              Authorization: `Bearer ${vercelToken}`
            }
          }
        );

        if (!statusResponse.ok) {
          console.error(
            '❌ Status check failed:',
            statusResponse.status,
            statusResponse.statusText
          );
          attempts++;
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`⏳ Attempt ${attempts + 1}: ${statusData.readyState}`);

        if (statusData.readyState === 'READY') {
          const finalUrl = `https://${statusData.url}`;
          console.log('🎉 Deployment ready:', finalUrl);
          return {
            success: true,
            url: finalUrl,
            deploymentId: deployment.id
          };
        }

        if (statusData.readyState === 'ERROR') {
          console.error('❌ Deployment failed:', statusData);
          return {
            success: false,
            error: statusData.errorMessage || 'Deployment failed during build'
          };
        }

        attempts++;
      } catch (statusError) {
        console.error('❌ Status check error:', statusError);
        attempts++;
      }
    }

    return {
      success: false,
      error: 'Deployment timeout - build took too long'
    };
  } catch (error) {
    console.error('❌ Deployment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error'
    };
  }
}

function generateFiles(website: any) {
  const heroSection = website.components?.find((c: any) => c.type === 'hero');
  const aboutSection = website.components?.find((c: any) => c.type === 'about');
  const gallerySection = website.components?.find(
    (c: any) => c.type === 'gallery'
  );
  const contactSection = website.components?.find(
    (c: any) => c.type === 'contact'
  );
  const productsSection = website.components?.find(
    (c: any) => c.type === 'products'
  );

  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/['"\\`]/g, '')
      .replace(/[\n\r\t]/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 200)
      .trim();
  };

  const title = cleanText(heroSection?.title || website.title || 'Welcome');
  const subtitle = cleanText(heroSection?.subtitle || 'My Website');

  // Package.json
  const packageJson = {
    name: 'site',
    version: '1.0.0',
    private: true,
    scripts: {
      build: 'next build',
      dev: 'next dev',
      start: 'next start'
    },
    dependencies: {
      next: '^14.2.0',
      react: '^18.3.0',
      'react-dom': '^18.3.0'
    }
  };

  // Next.js config
  const nextConfig = `const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}
module.exports = nextConfig`;

  const modernStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 0 20px; 
    }
    .section { 
      padding: 80px 0; 
    }
    .grid { 
      display: grid; 
      gap: 2rem; 
    }
    .grid-2 { 
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
    }
    .grid-3 { 
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    .btn:hover {
      background: #1d4ed8;
    }
    @media (max-width: 768px) {
      .section { padding: 60px 0; }
      .container { padding: 0 16px; }
      .grid { gap: 1.5rem; }
    }
  `;

  const sections = [];

  // Hero Section
  if (heroSection) {
    sections.push(`
      React.createElement('section', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '120px 0',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }
      }, React.createElement('div', {
        className: 'container'
      }, [
        React.createElement('h1', {
          key: 'title',
          style: { 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: '700', 
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }
        }, '${cleanText(heroSection.title || 'Welcome')}'),
        React.createElement('p', {
          key: 'subtitle',
          style: { 
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
            opacity: '0.9',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }
        }, '${cleanText(heroSection.subtitle || 'Welcome to my website')}'),
        React.createElement('a', {
          key: 'cta',
          href: '#about',
          className: 'btn',
          style: {
            fontSize: '1.1rem',
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }
        }, 'Learn More')
      ]))
    `);
  }

  // About Section
  if (aboutSection) {
    sections.push(`
      React.createElement('section', {
        id: 'about',
        className: 'section',
        style: { backgroundColor: '#f8fafc' }
      }, React.createElement('div', {
        className: 'container'
      }, React.createElement('div', {
        className: 'grid grid-2',
        style: { alignItems: 'center' }
      }, [
        React.createElement('div', { key: 'content' }, [
          React.createElement('h2', {
            key: 'title',
            style: { 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: '700', 
              marginBottom: '1.5rem', 
              color: '#1f2937' 
            }
          }, '${cleanText(aboutSection.title || 'About Me')}'),
          React.createElement('p', {
            key: 'text',
            style: { 
              color: '#6b7280', 
              fontSize: '1.1rem',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }
          }, '${cleanText(aboutSection.text || 'Tell your story here...')}')
        ])${
          aboutSection.image
            ? `,
        React.createElement('div', {
          key: 'image',
          style: { position: 'relative' }
        }, React.createElement('img', {
          src: '${aboutSection.image}',
          alt: 'About',
          style: { 
            width: '100%', 
            height: '400px', 
            objectFit: 'cover', 
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }
        }))`
            : ''
        }
      ])))
    `);
  }

  // Gallery Section
  if (gallerySection && gallerySection.images?.length > 0) {
    const galleryImages = gallerySection.images
      .map(
        (image: string, idx: number) => `
      React.createElement('div', {
        key: ${idx},
        className: 'card'
      }, React.createElement('img', {
        src: '${image}',
        alt: 'Gallery image',
        style: { 
          width: '100%', 
          height: '250px', 
          objectFit: 'cover',
          display: 'block'
        }
      }))
    `
      )
      .join(',');

    sections.push(`
      React.createElement('section', {
        className: 'section'
      }, React.createElement('div', {
        className: 'container'
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '700', 
            marginBottom: '3rem', 
            textAlign: 'center', 
            color: '#1f2937' 
          }
        }, '${cleanText(gallerySection.title || 'Gallery')}'),
        React.createElement('div', {
          key: 'grid',
          className: 'grid grid-3'
        }, [${galleryImages}])
      ]))
    `);
  }

  // Products Section
  if (productsSection && productsSection.products?.length > 0) {
    const productCards = productsSection.products
      .map(
        (product: any, idx: number) => `
      React.createElement('div', {
        key: ${idx},
        className: 'card'
      }, [
        ${
          product.image
            ? `React.createElement('img', {
          key: 'image',
          src: '${product.image}',
          alt: '${cleanText(product.name || 'Product')}',
          style: { width: '100%', height: '200px', objectFit: 'cover' }
        }),`
            : ''
        }
        React.createElement('div', {
          key: 'content',
          style: { padding: '1.5rem' }
        }, [
          React.createElement('h3', {
            key: 'name',
            style: { 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              marginBottom: '0.5rem', 
              color: '#1f2937' 
            }
          }, '${cleanText(product.name || 'Product')}'),
          React.createElement('p', {
            key: 'description',
            style: { 
              color: '#6b7280', 
              marginBottom: '1.5rem', 
              lineHeight: '1.6'
            }
          }, '${cleanText(product.description || '')}'),
          React.createElement('div', {
            key: 'footer',
            style: { 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }
          }, [
            React.createElement('span', {
              key: 'price',
              style: { 
                fontSize: '1.75rem', 
                fontWeight: '700', 
                color: '#059669' 
              }
            }, '$${product.price || '0'}')${
              product.link
                ? `,
            React.createElement('a', {
              key: 'link',
              href: '${product.link}',
              target: '_blank',
              className: 'btn',
              style: { fontSize: '0.9rem' }
            }, 'Buy Now')`
                : ''
            }
          ])
        ])
      ])
    `
      )
      .join(',');

    sections.push(`
      React.createElement('section', {
        className: 'section',
        style: { backgroundColor: '#f8fafc' }
      }, React.createElement('div', {
        className: 'container'
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '700', 
            marginBottom: '3rem', 
            textAlign: 'center', 
            color: '#1f2937' 
          }
        }, '${cleanText(productsSection.title || 'Products')}'),
        React.createElement('div', {
          key: 'grid',
          className: 'grid grid-3'
        }, [${productCards}])
      ]))
    `);
  }

  // Contact Section
  if (contactSection) {
    sections.push(`
      React.createElement('section', {
        className: 'section',
        style: { 
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', 
          color: 'white' 
        }
      }, React.createElement('div', {
        className: 'container',
        style: { textAlign: 'center' }
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '700', 
            marginBottom: '2rem' 
          }
        }, '${cleanText(contactSection.title || 'Contact Me')}')${
          contactSection.text
            ? `,
        React.createElement('p', {
          key: 'text',
          style: { 
            fontSize: '1.1rem',
            marginBottom: '2rem', 
            color: '#d1d5db', 
            maxWidth: '600px', 
            margin: '0 auto 2rem' 
          }
        }, '${cleanText(contactSection.text)}')`
            : ''
        }${
          contactSection.email
            ? `,
        React.createElement('div', {
          key: 'email',
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem', 
            fontSize: '1.2rem',
            flexWrap: 'wrap'
          }
        }, [
          React.createElement('span', {
            key: 'icon',
            style: { fontSize: '1.5rem' }
          }, '✉️'),
          React.createElement('a', {
            key: 'link',
            href: 'mailto:${contactSection.email}',
            style: { 
              color: '#60a5fa', 
              textDecoration: 'none',
              fontWeight: '600'
            }
          }, '${contactSection.email}')
        ])`
            : ''
        }
      ]))
    `);
  }

  // Main page with modern structure
  const appPage = `import React from 'react';

export default function Page() {
  return React.createElement('div', {
    style: { minHeight: '100vh' }
  }, [
    React.createElement('style', {
      key: 'styles',
      dangerouslySetInnerHTML: { __html: \`${modernStyles}\` }
    }),
    ${sections.join(',\n    ')}
  ]);
}`;

  // Root layout with better meta tags
  const appLayout = `import React from 'react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${subtitle}" />
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}`;

  return {
    'package.json': packageJson,
    'next.config.js': nextConfig,
    'app/page.js': appPage,
    'app/layout.js': appLayout
  };
}
