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

  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/['"\\`]/g, '') // Remove quotes, backslashes, backticks
      .replace(/[\n\r\t]/g, ' ') // Replace newlines and tabs with spaces
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII characters
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .substring(0, 50)
      .trim();
  };

  const title = cleanText(heroSection?.title || website.title || 'Welcome');
  const subtitle = cleanText(heroSection?.subtitle || 'My Website');

  // Minimal package.json with current working versions
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

  // Simple next.config.js for static export - minimal config
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

  // Clean React page
  const appPage = `import React from 'react';

export default function Page() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          ${title}
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.9,
          maxWidth: '600px'
        }}>
          ${subtitle}
        </p>
      </div>
    </div>
  );
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
