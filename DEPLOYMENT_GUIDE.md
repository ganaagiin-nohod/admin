# 🚀 Vercel Deployment Guide

## Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables**: Have all your API keys ready

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select your website builder repository

### 3. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

#### **Required Environment Variables:**

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/overview
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/overview

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Next.js
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_random_secret_string

# Optional: Sentry (if using)
NEXT_PUBLIC_SENTRY_DISABLED=true
```

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be live at `https://your-app-name.vercel.app`

## Post-Deployment Checklist

### ✅ **Test These Features:**

1. **Homepage**: Visit your deployed URL
2. **Authentication**: Sign up/sign in works
3. **Website Builder**: Create a test website
4. **Image Upload**: Upload an image to Cloudinary
5. **Public Sites**: Visit `/site/demo-portfolio`
6. **Database**: Check if data is saved to MongoDB

### 🔧 **Common Issues & Solutions:**

#### **Build Errors**
```bash
# If you get TypeScript errors during build
npm run lint:fix
npm run build
```

#### **Environment Variables Not Working**
- Make sure all variables are added in Vercel dashboard
- Check variable names match exactly
- Redeploy after adding variables

#### **Database Connection Issues**
- Verify MongoDB URI is correct
- Check if your MongoDB cluster allows connections from anywhere (0.0.0.0/0)
- Ensure database user has read/write permissions

#### **Cloudinary Upload Issues**
- Verify all Cloudinary credentials
- Check if upload preset is configured (if using unsigned uploads)

#### **Authentication Issues**
- Update Clerk dashboard with your Vercel domain
- Add your Vercel URL to allowed origins in Clerk

## Domain Configuration (Optional)

### Custom Domain Setup:

1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to your custom domain

## Performance Optimization

### Recommended Vercel Settings:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

## Monitoring & Analytics

### Enable Vercel Analytics:
1. Go to your project dashboard
2. Click "Analytics" tab
3. Enable Web Analytics
4. Monitor your website performance

## Security Considerations

### Production Security:
- [ ] All API keys are in environment variables
- [ ] MongoDB has proper access controls
- [ ] Clerk is configured for production domain
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Rate limiting is considered for API routes

## Backup Strategy

### Regular Backups:
- MongoDB: Set up automated backups
- Cloudinary: Images are automatically stored
- Code: Keep GitHub repository updated

## Scaling Considerations

As your app grows:
- Monitor Vercel function execution time
- Consider upgrading Vercel plan for higher limits
- Implement caching strategies
- Monitor MongoDB performance

---

## 🎉 Congratulations!

Your website builder SaaS is now live and ready for users to create their personal websites!

**Next Steps:**
1. Share your app with friends and family
2. Gather feedback and iterate
3. Consider adding premium features
4. Monitor usage and performance

**Your live app:** `https://your-app-name.vercel.app`