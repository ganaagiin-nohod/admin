#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });
}

console.log('🧪 Testing app before deployment...\n');

const tests = [
  {
    name: 'Environment Variables',
    test: () => {
      const requiredVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'MONGODB_URI',
        'NEXTAUTH_SECRET',
        'CLOUDINARY_CLOUD_NAME'
      ];

      const missing = requiredVars.filter((v) => !process.env[v]);
      if (missing.length > 0) {
        throw new Error(`Missing: ${missing.join(', ')}`);
      }
      return 'All required environment variables present';
    }
  },
  {
    name: 'TypeScript Check',
    test: () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return 'No TypeScript errors';
      } catch (error) {
        throw new Error('TypeScript errors found');
      }
    }
  },
  {
    name: 'Build Test',
    test: () => {
      try {
        execSync('pnpm build', { stdio: 'pipe' });
        return 'Build successful';
      } catch (error) {
        throw new Error('Build failed');
      }
    }
  },
  {
    name: 'Required Files',
    test: () => {
      const requiredFiles = [
        'src/app/page.tsx',
        'src/app/dashboard/website-builder/page.tsx',
        'src/app/site/[slug]/page.tsx',
        'src/models/Website.ts',
        'src/lib/mongodb.ts'
      ];

      const missing = requiredFiles.filter((f) => !fs.existsSync(f));
      if (missing.length > 0) {
        throw new Error(`Missing files: ${missing.join(', ')}`);
      }
      return 'All required files present';
    }
  }
];

let allPassed = true;

for (const test of tests) {
  try {
    const result = test.test();
    console.log(`✅ ${test.name}: ${result}`);
  } catch (error) {
    console.log(`❌ ${test.name}: ${error.message}`);
    allPassed = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All tests passed! Ready for deployment.');
  console.log('\nNext steps:');
  console.log('1. Add environment variables to Vercel Dashboard');
  console.log('2. Update NEXTAUTH_URL with your Vercel domain');
  console.log('3. Configure MongoDB to allow Vercel connections');
  console.log('4. Deploy to Vercel');
} else {
  console.log('❌ Some tests failed. Fix the issues above before deploying.');
}

console.log('\n📖 See VERCEL_DEPLOYMENT_FIX.md for detailed troubleshooting.');
