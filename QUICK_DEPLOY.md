# 🚀 Quick Deploy to Vercel

## 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## 2. Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

## 3. Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/overview
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/overview
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=random_secret_string
NEXT_PUBLIC_SENTRY_DISABLED=true
```

## 4. Update Clerk Settings

In your Clerk dashboard:
1. Add your Vercel domain to allowed origins
2. Update redirect URLs to use your Vercel domain

## 5. Test Your Deployment

Visit your deployed app and test:
- [ ] Homepage loads
- [ ] Sign up/Sign in works
- [ ] Website builder accessible
- [ ] Image upload works
- [ ] Demo site loads at `/site/demo-portfolio`

## 🎉 Done!

Your website builder SaaS is now live at `https://your-app.vercel.app`

**Share it with the world! 🌍**