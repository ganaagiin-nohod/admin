# Website Builder SaaS App

A complete website builder SaaS application built with Next.js, MongoDB, and Cloudinary that allows users to create personal websites through a simple form interface.

## 🚀 Features

- **No-Code Website Creation**: Users create websites by filling out forms, no coding required
- **Dynamic Components**: Support for Hero, About, Gallery, and Contact sections
- **Image Upload**: Cloudinary integration for image storage and optimization
- **Custom URLs**: Each website gets a unique slug like `/site/[slug]`
- **Real-time Preview**: See changes as you build
- **Responsive Design**: All websites are mobile-friendly by default

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **File Storage**: Cloudinary
- **Authentication**: Clerk
- **UI Components**: Shadcn/ui

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── websites/           # Website CRUD operations
│   │   ├── upload/             # Image upload endpoint
│   │   └── demo/               # Demo website creation
│   ├── dashboard/
│   │   └── website-builder/    # Main builder interface
│   └── site/[slug]/            # Dynamic public website pages
├── components/
│   └── website/
│       ├── Hero.tsx            # Hero section component
│       ├── About.tsx           # About section component
│       ├── Gallery.tsx         # Gallery section component
│       ├── Contact.tsx         # Contact section component
│       ├── ImageUpload.tsx     # Image upload component
│       └── WebsiteRenderer.tsx # Main website renderer
├── models/
│   └── Website.ts              # MongoDB schema
└── lib/
    ├── mongodb.ts              # Database connection
    └── cloudinary.ts           # Image upload utilities
```

## 🗄 Database Schema

```typescript
{
  userId: string,           // Clerk user ID
  slug: string,            // Unique URL slug
  title: string,           // Website title
  components: [            // Array of website sections
    {
      type: 'hero' | 'about' | 'gallery' | 'contact',
      title?: string,
      subtitle?: string,
      text?: string,
      image?: string,      // Single image URL
      images?: string[],   // Multiple image URLs
      email?: string
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Getting Started

### Prerequisites

1. Node.js 18+ installed
2. MongoDB database (local or Atlas)
3. Cloudinary account
4. Clerk account for authentication

### Environment Variables

Create a `.env.local` file with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard/overview"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard/overview"

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

### For End Users

1. **Sign Up**: Create an account at `/auth/sign-up`
2. **Access Builder**: Navigate to `/dashboard/website-builder`
3. **Create Website**: 
   - Fill in website title and choose a unique slug
   - Add sections (Hero, About, Gallery, Contact)
   - Upload images using the built-in uploader
   - Save your website
4. **View Website**: Your site will be live at `/site/[your-slug]`
5. **Share**: Share your custom URL with anyone

### For Developers

#### Adding New Component Types

1. Create the component in `src/components/website/`
2. Add the type to the `IWebsiteComponent` interface
3. Update the `WebsiteRenderer` to handle the new type
4. Add form fields in the website builder

#### API Endpoints

- `GET /api/websites` - List user's websites
- `POST /api/websites` - Create/update website
- `GET /api/websites/[slug]` - Get website by slug
- `POST /api/upload` - Upload image to Cloudinary

## 🎨 Customization

### Styling
- All components use Tailwind CSS
- Modify component styles in `src/components/website/`
- Global styles in `src/app/globals.css`

### Adding Features
- New section types can be added by extending the schema
- Custom fields can be added to existing components
- Advanced features like SEO, analytics can be integrated

## 🔧 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Environment variables
- File uploads (for Cloudinary)

## 🐛 Troubleshooting

### Common Issues

1. **Images not uploading**: Check Cloudinary credentials
2. **Database connection failed**: Verify MongoDB URI
3. **Authentication issues**: Check Clerk configuration
4. **Build errors**: Ensure all dependencies are installed

### Debug Mode

Visit `/test-website-builder` to test API endpoints and functionality.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

---

Built with ❤️ using Next.js, MongoDB, and Cloudinary