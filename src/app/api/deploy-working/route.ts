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

    console.log('📤 Creating deployment with proper format...');

    // The correct format for Vercel v13 API
    const deploymentFiles = Object.entries(files).map(([path, content]) => {
      let stringContent: string;
      if (typeof content === 'string') {
        stringContent = content;
      } else {
        stringContent = JSON.stringify(content, null, 2);
      }

      console.log(`📄 File ${path}: ${stringContent.length} characters`);

      // Clean the content thoroughly
      const cleanContent = stringContent
        .replace(/\0/g, '') // Remove null bytes
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n'); // Convert remaining \r to \n

      // Encode to base64 properly
      const base64Data = Buffer.from(cleanContent, 'utf8').toString('base64');

      console.log(
        `✅ ${path}: ${cleanContent.length} chars -> ${base64Data.length} base64 chars`
      );

      return {
        file: path,
        data: base64Data,
        encoding: 'base64' // Explicitly specify encoding
      };
    });

    // Use the standard v13 deployment API
    const deploymentPayload = {
      name: safeName,
      files: deploymentFiles,
      projectSettings: {
        framework: 'nextjs',
        buildCommand: 'npm run build',
        devCommand: 'npm run dev',
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

    // If deployment is ready immediately
    if (deployment.readyState === 'READY') {
      const finalUrl = `https://${deployment.url}`;
      return {
        success: true,
        url: finalUrl,
        deploymentId: deployment.id
      };
    }

    // Wait for deployment to complete
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes max

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
      .replace(/['"\\`]/g, '') // Remove quotes, backslashes, backticks
      .replace(/[\n\r\t]/g, ' ') // Replace newlines and tabs with spaces
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII characters
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .substring(0, 200) // Increased limit
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

  // Build sections array to avoid undefined variables
  const sections = [];

  // Hero Section (always show if exists)
  if (heroSection) {
    sections.push(`
      React.createElement('div', {
        style: {
          background: 'linear-gradient(to right, #2563eb, #9333ea)',
          color: 'white',
          padding: '80px 20px',
          textAlign: 'center'
        }
      }, React.createElement('div', {
        style: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }
      }, [
        React.createElement('h1', {
          key: 'title',
          style: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }
        }, '${cleanText(heroSection.title || 'Welcome')}'),
        React.createElement('p', {
          key: 'subtitle',
          style: { fontSize: '1.25rem', opacity: 0.9 }
        }, '${cleanText(heroSection.subtitle || 'Welcome to my website')}')
      ]))
    `);
  }

  // About Section
  if (aboutSection) {
    sections.push(`
      React.createElement('div', {
        style: { padding: '64px 20px', backgroundColor: '#f9fafb' }
      }, React.createElement('div', {
        style: { maxWidth: '1200px', margin: '0 auto' }
      }, React.createElement('div', {
        style: { 
          display: 'grid', 
          gridTemplateColumns: '${aboutSection.image ? 'repeat(2, 1fr)' : '1fr'}', 
          gap: '2rem', 
          alignItems: 'center' 
        }
      }, [
        React.createElement('div', { key: 'content' }, [
          React.createElement('h2', {
            key: 'title',
            style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }
          }, '${cleanText(aboutSection.title || 'About Me')}'),
          React.createElement('p', {
            key: 'text',
            style: { color: '#4b5563', lineHeight: '1.6' }
          }, '${cleanText(aboutSection.text || 'Tell your story here...')}')
        ])${
          aboutSection.image
            ? `,
        React.createElement('div', {
          key: 'image',
          style: { position: 'relative', height: '20rem' }
        }, React.createElement('img', {
          src: '${aboutSection.image}',
          alt: 'About',
          style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }
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
        style: { position: 'relative', height: '16rem', overflow: 'hidden', borderRadius: '0.5rem' }
      }, React.createElement('img', {
        src: '${image}',
        alt: 'Gallery image',
        style: { width: '100%', height: '100%', objectFit: 'cover' }
      }))
    `
      )
      .join(',');

    sections.push(`
      React.createElement('div', {
        style: { padding: '64px 20px' }
      }, React.createElement('div', {
        style: { maxWidth: '1200px', margin: '0 auto' }
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', color: '#1f2937' }
        }, '${cleanText(gallerySection.title || 'Gallery')}'),
        React.createElement('div', {
          key: 'grid',
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }
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
        style: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
      }, [
        ${
          product.image
            ? `React.createElement('img', {
          key: 'image',
          src: '${product.image}',
          alt: '${cleanText(product.name || 'Product')}',
          style: { width: '100%', height: '12rem', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }
        }),`
            : ''
        }
        React.createElement('h3', {
          key: 'name',
          style: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }
        }, '${cleanText(product.name || 'Product')}'),
        React.createElement('p', {
          key: 'description',
          style: { color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }
        }, '${cleanText(product.description || '')}'),
        React.createElement('div', {
          key: 'footer',
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
        }, [
          React.createElement('span', {
            key: 'price',
            style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }
          }, '$${product.price || '0'}')${
            product.link
              ? `,
          React.createElement('a', {
            key: 'link',
            href: '${product.link}',
            target: '_blank',
            style: { backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', textDecoration: 'none', fontSize: '0.875rem' }
          }, 'Buy Now')`
              : ''
          }
        ])
      ])
    `
      )
      .join(',');

    sections.push(`
      React.createElement('div', {
        style: { padding: '64px 20px', backgroundColor: '#f9fafb' }
      }, React.createElement('div', {
        style: { maxWidth: '1200px', margin: '0 auto' }
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', color: '#1f2937' }
        }, '${cleanText(productsSection.title || 'Products')}'),
        React.createElement('div', {
          key: 'grid',
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }
        }, [${productCards}])
      ]))
    `);
  }

  // Contact Section
  if (contactSection) {
    sections.push(`
      React.createElement('div', {
        style: { padding: '64px 20px', backgroundColor: '#1f2937', color: 'white' }
      }, React.createElement('div', {
        style: { maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }
        }, '${cleanText(contactSection.title || 'Contact Me')}')${
          contactSection.email
            ? `,
        React.createElement('div', {
          key: 'email',
          style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.125rem' }
        }, [
          React.createElement('svg', {
            key: 'icon',
            style: { width: '1.25rem', height: '1.25rem' },
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          })),
          React.createElement('a', {
            key: 'link',
            href: 'mailto:${contactSection.email}',
            style: { color: '#60a5fa', textDecoration: 'none' }
          }, '${contactSection.email}')
        ])`
            : ''
        }${
          contactSection.text
            ? `,
        React.createElement('p', {
          key: 'text',
          style: { marginTop: '1rem', color: '#d1d5db', maxWidth: '32rem', margin: '1rem auto 0' }
        }, '${cleanText(contactSection.text)}')`
            : ''
        }
      ]))
    `);
  }

  // Main page with all sections
  const appPage = `import React from 'react';

export default function Page() {
  return React.createElement('div', {
    style: { minHeight: '100vh' }
  }, [
    ${sections.join(',\n    ')}
  ]);
}`;

  // Root layout
  const appLayout = `import React from 'react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${subtitle}" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
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
