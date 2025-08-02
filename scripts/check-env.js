#!/usr/bin/env node

console.log('🔍 Checking Environment Variables...\n');

const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
  'NEXTAUTH_URL',
  'LINGODOTDEV_API_KEY'
];

let allRequired = true;

console.log('✅ Required Environment Variables:');
requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  const status = value ? '✅' : '❌';
  const displayValue = value
    ? value.length > 20
      ? value.substring(0, 20) + '...'
      : value
    : 'NOT SET';

  console.log(`${status} ${envVar}: ${displayValue}`);

  if (!value) {
    allRequired = false;
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  const status = value ? '✅' : '⚠️';
  const displayValue = value
    ? value.length > 20
      ? value.substring(0, 20) + '...'
      : value
    : 'NOT SET';

  console.log(`${status} ${envVar}: ${displayValue}`);
});

console.log('\n' + '='.repeat(50));

if (allRequired) {
  console.log('🎉 All required environment variables are set!');
  console.log('Your app should deploy successfully.');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('Please add them to your Vercel dashboard or .env file.');
}

console.log('\n📖 See DEPLOYMENT_GUIDE.md for detailed instructions.');
