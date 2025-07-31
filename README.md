# 🚀 Next.js Admin Dashboard with Multilanguage Support

<div align="center">
  <strong>A modern, feature-rich admin dashboard built with Next.js 15, Shadcn/ui, and comprehensive multilanguage support</strong>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

<br />

## ✨ Features

### 🌍 **Multilanguage Support**
- **6 Languages**: English, French, German, Russian, Chinese, Mongolian
- **Language Switcher**: Easy language switching in header
- **Persistent Selection**: Language preference saved in localStorage
- **Translation Management**: Powered by lingo.dev
- **Dynamic Loading**: Translations loaded on-demand

### 🔐 **Authentication & Security**
- **Clerk Integration**: Secure authentication with multiple sign-in options
- **Social Logins**: Google, GitHub, and more
- **User Management**: Complete profile and security settings
- **Protected Routes**: Role-based access control

### 📊 **Dashboard & Analytics**
- **Interactive Charts**: Recharts integration for data visualization
- **Real-time Data**: Live updates and analytics
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching with persistence

### 🛠️ **Data Management**
- **Advanced Tables**: Tanstack tables with server-side features
- **Search & Filter**: Real-time search with debouncing
- **Pagination**: Efficient data loading
- **CRUD Operations**: Complete product management
- **File Upload**: Cloudinary integration for media

### 🎯 **Modern Development**
- **App Router**: Next.js 15 App Router
- **Server Components**: Optimized performance
- **Type Safety**: Full TypeScript coverage
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: Zustand for client state

## 🏗️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15, React 19, TypeScript 5.7 |
| **Styling** | Tailwind CSS v4, Shadcn/ui Components |
| **Authentication** | Clerk |
| **Database** | MongoDB, Mongoose |
| **State Management** | Zustand, Nuqs (URL state) |
| **Forms** | React Hook Form, Zod |
| **Tables** | Tanstack Table |
| **Charts** | Recharts |
| **File Upload** | Cloudinary |
| **Translations** | Lingo.dev |
| **Error Tracking** | Sentry |
| **Development** | ESLint, Prettier, Husky |

## 🌐 Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| English | `en` | 🇺🇸 | ✅ Default |
| French | `fr` | 🇫🇷 | ✅ Complete |
| German | `de` | 🇩🇪 | ✅ Complete |
| Russian | `ru` | 🇷🇺 | ✅ Complete |
| Chinese | `zh` | 🇨🇳 | ✅ Complete |
| Mongolian | `mn` | 🇲🇳 | ✅ Complete |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard pages
│   │   ├── overview/      # Analytics dashboard
│   │   ├── product/       # Product management
│   │   ├── reservation/   # Reservation system
│   │   └── profile/       # User profile
│   └── api/               # API routes
│
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui components
│   ├── layout/           # Layout components
│   │   ├── header.tsx    # Header with language switcher
│   │   ├── app-sidebar.tsx # Navigation sidebar
│   │   └── providers.tsx # Context providers
│   └── language-switcher.tsx # Language selection
│
├── features/             # Feature-based modules
│   ├── products/         # Product management
│   ├── auth/            # Authentication
│   ├── overview/        # Dashboard analytics
│   └── profile/         # User profile
│
├── contexts/            # React contexts
│   └── language-context.tsx # Language state management
│
├── hooks/               # Custom hooks
│   ├── use-t.ts         # Translation hook
│   └── use-translations.ts # Advanced translations
│
├── translations/        # Language files
│   ├── en.json         # English (base)
│   ├── fr.json         # French
│   ├── de.json         # German
│   ├── ru.json         # Russian
│   ├── zh.json         # Chinese
│   └── mn.json         # Mongolian
│
├── lib/                # Utilities and configurations
│   ├── translation-service.ts # Translation service
│   ├── mongodb.ts      # Database connection
│   └── utils.ts        # Shared utilities
│
└── types/              # TypeScript definitions
    └── index.ts        # Global types
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database
- Clerk account
- Cloudinary account (optional)
- Lingo.dev account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp env.example.txt .env.local
   ```

4. **Configure environment variables**
   ```env
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # File Upload (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Translations (Lingo.dev)
   LINGODOTDEV_API_KEY=your_lingo_api_key
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 🌍 Using Translations

**In Components:**
```tsx
import { useT } from '@/hooks/use-t';

function MyComponent() {
  const t = useT();
  
  return (
    <div>
      <h1>{t('Dashboard')}</h1>
      <p>{t('Welcome to the dashboard')}</p>
    </div>
  );
}
```

**Language Context:**
```tsx
import { useLanguage } from '@/contexts/language-context';

function LanguageExample() {
  const { currentLanguage, setLanguage } = useLanguage();
  
  return (
    <div>
      <p>Current: {currentLanguage}</p>
      <button onClick={() => setLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### 📊 Data Tables

```tsx
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

function ProductsPage() {
  return (
    <DataTable
      columns={columns}
      data={products}
      searchKey="name"
      placeholder="Search products..."
    />
  );
}
```

### 📝 Forms with Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from './schema';

function ProductForm() {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
    },
  });
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  );
}
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm translate` | Run lingo.dev translation |
| `pnpm translate:extract` | Extract translatable strings |
| `pnpm translate:sync` | Sync with lingo.dev |

## 📄 Key Pages

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/dashboard` | Analytics overview with charts |
| **Products** | `/dashboard/product` | Product management with tables |
| **Add Product** | `/dashboard/product/new` | Create new products |
| **Reservations** | `/dashboard/reservation` | Reservation management |
| **Profile** | `/dashboard/profile` | User profile settings |
| **Authentication** | `/auth/sign-in` | Login page |

## 🎨 Customization

### Adding New Languages

1. **Add language to config:**
   ```typescript
   // src/config/languages.ts
   export const languages = [
     // existing languages...
     { code: 'es', name: 'Español', flag: '🇪🇸' },
   ];
   ```

2. **Create translation file:**
   ```bash
   touch src/translations/es.json
   ```

3. **Add translations:**
   ```json
   {
     "Dashboard": "Panel de Control",
     "Products": "Productos"
   }
   ```

### Theme Customization

Modify `src/app/globals.css` and `tailwind.config.js` for custom themes.

### Adding New Features

1. Create feature directory in `src/features/`
2. Add components, hooks, and utilities
3. Update navigation in `src/constants/data.ts`

## 🔧 Configuration Files

- **`next.config.ts`** - Next.js configuration
- **`tailwind.config.js`** - Tailwind CSS setup
- **`lingo.config.js`** - Translation configuration
- **`components.json`** - Shadcn/ui configuration
- **`.eslintrc.json`** - ESLint rules
- **`.prettierrc`** - Prettier formatting

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Clerk](https://clerk.com/) for authentication
- [Lingo.dev](https://lingo.dev/) for translation management
- [Next.js](https://nextjs.org/) team for the amazing framework

## 📞 Support

- 📧 Email: your-email@example.com
- 💬 Discord: [Join our community](https://discord.gg/your-invite)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/your-repo/issues)

---

<div align="center">
  <strong>Built with ❤️ using Next.js and modern web technologies</strong>
</div>