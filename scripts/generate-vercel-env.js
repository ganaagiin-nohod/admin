#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📋 Vercel Environment Variables Setup Guide\n');

try {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');

  const envVars = {};

  envContent.split('\n').forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });

  console.log(
    '🔧 Add these to your Vercel Dashboard (Settings → Environment Variables):\n'
  );
  console.log('Variable Name | Value | Environment');
  console.log('-------------|-------|------------');

  Object.entries(envVars).forEach(([key, value]) => {
    // Clean up the value (remove quotes if present)
    const cleanValue = value.replace(/^["']|["']$/g, '');

    // Determine which environments this should be added to
    let environments = 'Production, Preview, Development';

    // Special handling for NEXTAUTH_URL
    if (key === 'NEXTAUTH_URL') {
      console.log(`${key} | https://your-app-name.vercel.app | Production`);
      console.log(
        `${key} | https://your-app-name-git-main.vercel.app | Preview`
      );
      console.log(`${key} | http://localhost:3000 | Development`);
    } else {
      console.log(`${key} | ${cleanValue} | ${environments}`);
    }
  });

  console.log('\n📝 Instructions:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add each variable above');
  console.log(
    '5. For NEXTAUTH_URL, replace "your-app-name" with your actual Vercel app name'
  );
  console.log('6. Redeploy your project');
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  console.log('Make sure you have a .env file in your project root.');
}

console.log(
  '\n⚠️  NEVER put these values directly in vercel.json or commit them to git!'
);
