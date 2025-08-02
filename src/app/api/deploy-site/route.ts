import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Website from '@/models/Website';
import { SiteGenerator } from '@/lib/site-generator';
import { VercelDeployer } from '@/lib/vercel-deployer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { websiteId, deploymentType = 'vercel' } = await request.json();

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

    // Generate the static site
    const tempDir = path.join(
      process.cwd(),
      'temp',
      `site-${website.slug}-${Date.now()}`
    );
    const generator = new SiteGenerator({
      website,
      outputDir: tempDir
    });

    await generator.generateSite();

    if (deploymentType === 'vercel') {
      // Deploy to Vercel
      const vercelToken = process.env.VERCEL_TOKEN;
      if (!vercelToken) {
        return NextResponse.json(
          { error: 'Vercel token not configured' },
          { status: 500 }
        );
      }

      const deployer = new VercelDeployer(vercelToken);

      // Read all generated files
      const files = await readDirectoryRecursive(tempDir);
      const fileContents: Record<string, string> = {};

      for (const filePath of files) {
        const relativePath = path.relative(tempDir, filePath);
        const content = await readFile(filePath, 'utf-8');
        fileContents[relativePath] = content;
      }

      // Deploy to Vercel
      const deploymentResult = await deployer.deployWebsite(
        website,
        fileContents
      );

      // Clean up temp directory
      await fs.promises.rm(tempDir, { recursive: true, force: true });

      if (deploymentResult.success) {
        // Update website with deployment URL
        website.deploymentUrl = deploymentResult.url;
        website.deploymentId = deploymentResult.deploymentId;
        await website.save();

        return NextResponse.json({
          success: true,
          url: deploymentResult.url,
          deploymentId: deploymentResult.deploymentId
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
    } else {
      // For other deployment types (Netlify, GitHub Pages, etc.)
      return NextResponse.json({
        success: true,
        message: 'Site generated successfully',
        path: tempDir
      });
    }
  } catch (error) {
    console.error('Error deploying site:', error);
    return NextResponse.json({ error: 'Deployment failed' }, { status: 500 });
  }
}

async function readDirectoryRecursive(dir: string): Promise<string[]> {
  const files: string[] = [];
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      const subFiles = await readDirectoryRecursive(fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}
