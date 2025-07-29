# Cloudinary Setup Guide

## Quick Setup (Free Tier)

1. **Sign up for Cloudinary** (free tier available):
   - Go to https://cloudinary.com/users/register/free
   - Sign up with your email

2. **Get your credentials**:
   - After signing up, go to your Dashboard
   - Copy the following values:
     - Cloud Name
     - API Key  
     - API Secret

3. **Update your .env file**:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

## For Production Deployment

Make sure to add these environment variables to your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Railway/Render: Add in their respective dashboards

## Fallback Behavior

- **With Cloudinary configured**: Images uploaded to cloud storage (recommended for production)
- **Without Cloudinary**: Images converted to base64 data URLs (works for development/demo)

## Benefits of Cloudinary

- ✅ Works in serverless environments
- ✅ Automatic image optimization
- ✅ CDN delivery
- ✅ Image transformations
- ✅ Free tier: 25GB storage, 25GB bandwidth/month