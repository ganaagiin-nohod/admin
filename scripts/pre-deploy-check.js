#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Pre-deployment checklist for Website Builder SaaS\n');

const checks = [
  {
    name: 'Package.json exists',
    check: () => fs.existsSync('package.json'),
    fix: 'Make sure package.json is in the root directory'
  },
  {
    name: 'Next.js config exists',
    check: () =>
      fs.existsSync('next.config.ts') || fs.existsSync('next.config.js'),
    fix: 'Create next.config.ts file'
  },
  {
    name: 'Environment variables template',
    check: () => fs.existsSync('.env') || fs.existsSync('.env.local'),
    fix: 'Create .env.local with required variables'
  },
  {
    name: 'MongoDB model exists',
    check: () => fs.existsSync('src/models/Website.ts'),
    fix: 'Create Website model in src/models/Website.ts'
  },
  {
    name: 'API routes exist',
    check: () => fs.existsSync('src/app/api/websites/route.ts'),
    fix: 'Create API routes in src/app/api/'
  },
  {
    name: 'Website builder page exists',
    check: () => fs.existsSync('src/app/dashboard/website-builder/page.tsx'),
    fix: 'Create website builder page'
  },
  {
    name: 'Dynamic site route exists',
    check: () => fs.existsSync('src/app/site/[slug]/page.tsx'),
    fix: 'Create dynamic site route'
  },
  {
    name: 'Cloudinary config exists',
    check: () => fs.existsSync('src/lib/cloudinary.ts'),
    fix: 'Create Cloudinary configuration'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${check.name}`);

  if (!passed) {
    console.log(`   Fix: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Vercel');
  console.log('3. Add environment variables in Vercel dashboard');
  console.log('4. Deploy!');
} else {
  console.log(
    '❌ Some checks failed. Please fix the issues above before deploying.'
  );
}

console.log('\n📖 See DEPLOYMENT_GUIDE.md for detailed instructions.');
