# 🚀 GanaBeats Admin - Full-Stack Creative Platform

<div align="center">
  <strong>A comprehensive creative platform with music integration, job tracking, website building, and productivity tools</strong>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Spotify-API-1DB954?style=for-the-badge&logo=spotify" alt="Spotify API" />
  <img src="https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql" alt="GraphQL" />
</div>

<br />

## ✨ Core Features

### � **\*GanaBeats - Music Integration**

- **Spotify Integration**: Connect and manage Spotify playlists
- **Music Dashboard**: Curated playlists and music discovery
- **Community Playlists**: Share and discover music from others
- **Daily Log Integration**: Attach playlists to your daily activities
- **Music Recommendations**: AI-powered music suggestions

### � **GanaLnog - Personal Productivity**

- **Daily Logging**: Track your daily activities and thoughts
- **Entry Management**: Add, edit, and organize log entries
- **Public Feed**: Share your logs with the community
- **AI Suggestions**: Get intelligent suggestions for your logs
- **Jobs Integration**: Connect your work activities to daily logs

### � *r*Job Application Tracker\*\*

- **Application Management**: Track job applications and status
- **Gmail Integration**: Auto-sync job emails and responses
- **Application Insights**: Analytics on your job search progress
- **Auto-sync Settings**: Automated email processing
- **Status Tracking**: Complete application lifecycle management

### 🌐 **Website Builder**

- **Drag & Drop Builder**: Visual website creation
- **AI Content Generation**: Automated content creation
- **Template System**: Pre-built website templates
- **Image Management**: Cloudinary integration for media
- **Live Preview**: Real-time website preview
- **Deployment**: One-click website deployment

### 📊 **Presentation Builder**

- **AI-Powered Creation**: Generate presentations with AI
- **Slide Management**: Create, edit, and organize slides
- **Export Options**: PDF and other format exports
- **Template Library**: Professional presentation templates

### 🗂️ **Kanban Board**

- **Task Management**: Drag-and-drop task organization
- **Project Tracking**: Visual project management
- **Team Collaboration**: Multi-user task boards
- **Status Updates**: Real-time task status tracking

### 🔐 **Authentication & Security**

- **Clerk Integration**: Secure authentication with multiple sign-in options
- **Social Logins**: Google, GitHub, and more
- **User Management**: Complete profile and security settings
- **Protected Routes**: Role-based access control

### 🌍 **Multilanguage Support**

- **6 Languages**: English, French, German, Russian, Chinese, Mongolian
- **Language Switcher**: Easy language switching in header
- **Persistent Selection**: Language preference saved in localStorage
- **Translation Management**: Powered by lingo.dev
- **Dynamic Loading**: Translations loaded on-demand

### 📊 **Dashboard & Analytics**

- **Interactive Charts**: Recharts integration for data visualization
- **Real-time Data**: Live updates and analytics
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching with persistence

### 🛠️ **Data Management**

- **Advanced Tables**: Tanstack tables with server-side features
- **Search & Filter**: Real-time search with debouncing
- **Pagination**: Efficient data loading
- **CRUD Operations**: Complete product and reservation management
- **File Upload**: Cloudinary integration for media

### ⚡ **Modern Development**

- **App Router**: Next.js 15 App Router with Turbopack
- **Server Components**: Optimized performance
- **GraphQL API**: Apollo Server integration
- **Type Safety**: Full TypeScript coverage
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: Zustand for client state
- **Command Palette**: KBar integration for quick actions

## 🏗️ Tech Stack

| Category              | Technologies                           |
| --------------------- | -------------------------------------- |
| **Framework**         | Next.js 15.3, React 19, TypeScript 5.7 |
| **Styling**           | Tailwind CSS v4, Shadcn/ui Components  |
| **Authentication**    | Clerk                                  |
| **Database**          | MongoDB, Mongoose                      |
| **API**               | GraphQL (Apollo Server), REST APIs     |
| **Music Integration** | Spotify Web API                        |
| **Email Integration** | Gmail API, Google APIs                 |
| **AI/ML**             | Google Generative AI                   |
| **State Management**  | Zustand, Nuqs (URL state)              |
| **Forms**             | React Hook Form, Zod                   |
| **Tables**            | Tanstack Table                         |
| **Charts**            | Recharts                               |
| **File Upload**       | Cloudinary                             |
| **Translations**      | Lingo.dev                              |
| **UI Components**     | Radix UI, Lucide Icons, Tabler Icons   |
| **Drag & Drop**       | DND Kit                                |
| **PDF Generation**    | jsPDF, html2canvas                     |
| **Command Palette**   | KBar                                   |
| **Error Tracking**    | Sentry                                 |
| **Development**       | ESLint, Prettier, Husky, Turbopack     |

## 🌐 Supported Languages

| Language  | Code | Flag | Status      |
| --------- | ---- | ---- | ----------- |
| English   | `en` | 🇺🇸   | ✅ Default  |
| French    | `fr` | 🇫🇷   | ✅ Complete |
| German    | `de` | 🇩🇪   | ✅ Complete |
| Russian   | `ru` | 🇷🇺   | ✅ Complete |
| Chinese   | `zh` | 🇨🇳   | ✅ Complete |
| Mongolian | `mn` | 🇲🇳   | ✅ Complete |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Main dashboard pages
│   │   ├── overview/      # Analytics dashboard
│   │   ├── ganalog/       # Personal logging system
│   │   ├── jobs/          # Job application tracker
│   │   ├── kanban/        # Task management board
│   │   ├── website-builder/ # Website creation tool
│   │   ├── presentation-builder/ # AI presentation tool
│   │   ├── product/       # Product management
│   │   ├── reservation/   # Reservation system
│   │   └── profile/       # User profile
│   ├── site/[slug]/       # Dynamic website rendering
│   ├── debug/             # Development debugging
│   └── api/               # API routes
│       ├── ganalog/       # Personal logging APIs
│       ├── jobs/          # Job tracking APIs
│       ├── spotify/       # Music integration APIs
│       ├── gmail/         # Email integration APIs
│       ├── websites/      # Website builder APIs
│       ├── graphql/       # GraphQL endpoint
│       └── webhooks/      # External webhooks
│
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui components
│   ├── layout/           # Layout components
│   ├── ganabeats/        # Music integration components
│   ├── ganalog/          # Personal logging components
│   ├── jobs/             # Job tracking components
│   ├── website/          # Website builder components
│   ├── presentation/     # Presentation builder components
│   ├── kbar/             # Command palette components
│   ├── forms/            # Form components
│   ├── tables/           # Data table components
│   └── providers/        # Context providers
│
├── features/             # Feature-based modules
│   ├── auth/             # Authentication
│   ├── overview/         # Dashboard analytics
│   ├── products/         # Product management
│   ├── profile/          # User profile
│   └── kanban/           # Task management
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
├── models/             # Database models
│   └── [various].ts    # MongoDB schemas
│
└── types/              # TypeScript definitions
    └── index.ts        # Global types
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MongoDB database
- Clerk account for authentication
- Spotify Developer account (for music features)
- Gmail API credentials (for job tracking)
- Cloudinary account (for file uploads)
- Google AI API key (for AI features)
- Lingo.dev account (for translations)

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

   # Spotify Integration
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

   # Gmail Integration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback

   # AI Features
   GOOGLE_AI_API_KEY=your_google_ai_api_key

   # File Upload (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Translations (Lingo.dev)
   LINGODOTDEV_API_KEY=your_lingo_api_key

   # Error Tracking (Sentry)
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   NEXT_PUBLIC_SENTRY_ORG=your_sentry_org
   NEXT_PUBLIC_SENTRY_PROJECT=your_sentry_project
   ```

5. **Start development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### � GsanaBeats Music Integration

**Connect Spotify:**

```tsx
// Spotify connection is handled automatically
// Users can connect via the GanaBeats dashboard
const handleConnectSpotify = () => {
  window.location.href = '/api/spotify/auth';
};
```

**Using Music Components:**

```tsx
import { MusicDashboard } from '@/components/ganabeats/MusicDashboard';
import { PlaylistPicker } from '@/components/ganabeats/PlaylistPicker';

function MyMusicPage() {
  return (
    <div>
      <MusicDashboard />
      <PlaylistPicker onPlaylistSelect={handlePlaylistSelect} />
    </div>
  );
}
```

### 📝 GanaLog Personal Logging

**Creating Log Entries:**

```tsx
import { AddEntryDialog } from '@/components/ganalog/AddEntryDialog';

function LoggingPage() {
  return (
    <AddEntryDialog onEntryAdded={handleEntryAdded} defaultDate={new Date()} />
  );
}
```

### 💼 Job Application Tracking

**Gmail Integration:**

```tsx
import { GmailConnection } from '@/components/jobs/GmailConnection';

function JobsPage() {
  return <GmailConnection onConnectionSuccess={handleGmailConnected} />;
}
```

### 🌐 Website Builder

**Creating Websites:**

```tsx
import { WebsiteRenderer } from '@/components/website/WebsiteRenderer';

function WebsiteBuilder() {
  const [websiteData, setWebsiteData] = useState(null);

  return <WebsiteRenderer data={websiteData} onUpdate={setWebsiteData} />;
}
```

### 📊 AI Presentation Builder

**Generating Presentations:**

```tsx
import { AIPresentationDialog } from '@/components/presentation/AIPresentationDialog';

function PresentationPage() {
  return (
    <AIPresentationDialog onPresentationGenerated={handlePresentationCreated} />
  );
}
```

### 🗂️ Kanban Task Management

**Using Drag & Drop:**

```tsx
// Kanban boards use DND Kit for drag and drop functionality
// Components are automatically configured for task management
```

### ⌘ Command Palette (KBar)

**Quick Actions:**

```tsx
// Press Cmd+K (Mac) or Ctrl+K (Windows) to open command palette
// Navigate quickly between pages and features
```

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

### 📊 Data Tables

```tsx
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

function ProductsPage() {
  return (
    <DataTable
      columns={columns}
      data={products}
      searchKey='name'
      placeholder='Search products...'
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
      price: 0
    }
  });

  return <Form {...form}>{/* Form fields */}</Form>;
}
```

## 🛠️ Available Scripts

| Script                     | Description                             |
| -------------------------- | --------------------------------------- |
| `pnpm dev`                 | Start development server with Turbopack |
| `pnpm build`               | Build for production (optimized memory) |
| `pnpm build:memory`        | Build with high memory allocation       |
| `pnpm build:low-memory`    | Build with low memory allocation        |
| `pnpm start`               | Start production server                 |
| `pnpm lint`                | Run ESLint                              |
| `pnpm lint:fix`            | Fix ESLint issues and format code       |
| `pnpm lint:strict`         | Strict linting with zero warnings       |
| `pnpm format`              | Format code with Prettier               |
| `pnpm translate`           | Run lingo.dev translation               |
| `pnpm translate:extract`   | Extract translatable strings            |
| `pnpm translate:sync`      | Sync with lingo.dev                     |
| `pnpm pre-deploy`          | Run pre-deployment checks               |
| `pnpm check-env`           | Validate environment variables          |
| `pnpm generate-vercel-env` | Generate Vercel environment config      |
| `pnpm test-deploy`         | Test deployment readiness               |
| `pnpm deploy`              | Deploy to Vercel with checks            |

## 📄 Key Pages

| Page                     | Route                             | Description                     |
| ------------------------ | --------------------------------- | ------------------------------- |
| **Dashboard**            | `/dashboard/overview`             | Analytics overview with charts  |
| **GanaLog**              | `/dashboard/ganalog`              | Personal daily logging system   |
| **Job Tracker**          | `/dashboard/jobs`                 | Job application management      |
| **Kanban Board**         | `/dashboard/kanban`               | Task management system          |
| **Website Builder**      | `/dashboard/website-builder`      | Visual website creation tool    |
| **Presentation Builder** | `/dashboard/presentation-builder` | AI-powered presentation creator |
| **Products**             | `/dashboard/product`              | Product management with tables  |
| **Reservations**         | `/dashboard/reservation`          | Reservation management          |
| **Profile**              | `/dashboard/profile`              | User profile settings           |
| **Authentication**       | `/auth/sign-in`                   | Login page                      |
| **Dynamic Sites**        | `/site/[slug]`                    | User-generated websites         |
| **Debug Tools**          | `/debug`                          | Development debugging interface |

## 🎨 Customization

### Adding New Music Integrations

1. **Create new music service:**

   ```typescript
   // src/lib/music-services/apple-music.ts
   export class AppleMusicService {
     // Implement music service interface
   }
   ```

2. **Add to music dashboard:**
   ```typescript
   // Update src/components/ganabeats/MusicDashboard.tsx
   ```

### Extending Job Tracking

1. **Add new job sources:**
   ```typescript
   // src/lib/job-sources/linkedin.ts
   export class LinkedInJobSource {
     // Implement job source interface
   }
   ```

### Custom Website Templates

1. **Create template:**

   ```typescript
   // src/components/website/templates/MyTemplate.tsx
   export const MyTemplate = ({ data }) => {
     // Template implementation
   };
   ```

2. **Register template:**
   ```typescript
   // src/lib/website-templates.ts
   export const templates = {
     // existing templates...
     myTemplate: MyTemplate
   };
   ```

### Adding New Languages

1. **Add language to config:**

   ```typescript
   // src/config/languages.ts
   export const languages = [
     // existing languages...
     { code: 'es', name: 'Español', flag: '🇪🇸' }
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
     "Products": "Productos",
     "GanaLog": "Registro Gana",
     "Jobs": "Trabajos"
   }
   ```

### Theme Customization

Modify `src/app/globals.css` and `tailwind.config.js` for custom themes.

### Adding New Features

1. Create feature directory in `src/features/`
2. Add components, hooks, and utilities
3. Update navigation in `src/constants/data.ts`
4. Add API routes in `src/app/api/`
5. Create database models if needed

## 🔧 Configuration Files

- **`next.config.ts`** - Next.js configuration with Sentry, Spotify, and optimization settings
- **`tailwind.config.js`** - Tailwind CSS v4 setup
- **`lingo.config.js`** - Translation configuration
- **`components.json`** - Shadcn/ui configuration
- **`.eslintrc.json`** - ESLint rules
- **`.prettierrc`** - Prettier formatting
- **`vercel.json`** - Vercel deployment configuration
- **`scripts/`** - Deployment and environment check scripts

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

## � New Featugres Highlights

### Recent Additions:

- **🎵 GanaBeats**: Complete Spotify integration with playlist management
- **📝 GanaLog**: Personal productivity and daily logging system
- **💼 Job Tracker**: Gmail-integrated job application management
- **🌐 Website Builder**: AI-powered website creation tool
- **� Prpesentation Builder**: AI-generated presentations with export
- **🗂️ Kanban Board**: Drag-and-drop task management
- **⌘ Command Palette**: Quick navigation with KBar
- **� GrarphQL API**: Apollo Server integration
- **🤖 AI Integration**: Google Generative AI for content creation
- **📧 Email Integration**: Gmail API for automated workflows
- **🎨 Enhanced UI**: New components and improved user experience

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Clerk](https://clerk.com/) for authentication
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music integration
- [Google APIs](https://developers.google.com/) for Gmail and AI services
- [Lingo.dev](https://lingo.dev/) for translation management
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Apollo GraphQL](https://www.apollographql.com/) for the GraphQL implementation
- [DND Kit](https://dndkit.com/) for drag and drop functionality

## 📞 Support

- 📧 Email: your-email@example.com
- 💬 Discord: [Join our community](https://discord.gg/your-invite)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/your-repo/issues)
- 🎵 Music Features: [GanaBeats Documentation](https://github.com/your-username/your-repo/wiki/ganabeats)
- 📝 Logging System: [GanaLog Guide](https://github.com/your-username/your-repo/wiki/ganalog)

---

<div align="center">
  <strong>🎵 GanaBeats Admin - Where creativity meets productivity</strong>
  <br />
  <em>Built with ❤️ using Next.js, Spotify API, AI, and modern web technologies</em>
</div>
