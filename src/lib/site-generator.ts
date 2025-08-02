import { IWebsite } from '@/models/Website';
import fs from 'fs';
import path from 'path';

export interface SiteGenerationOptions {
  website: IWebsite;
  outputDir: string;
}

export class SiteGenerator {
  private website: IWebsite;
  private outputDir: string;

  constructor(options: SiteGenerationOptions) {
    this.website = options.website;
    this.outputDir = options.outputDir;
  }

  async generateSite(): Promise<void> {
    // Create project structure
    await this.createProjectStructure();

    // Generate package.json
    await this.generatePackageJson();

    // Generate Next.js config
    await this.generateNextConfig();

    // Generate pages
    await this.generatePages();

    // Generate components
    await this.generateComponents();

    // Generate styles
    await this.generateStyles();
  }

  private async createProjectStructure(): Promise<void> {
    const dirs = ['src/app', 'src/components', 'src/lib', 'public'];

    for (const dir of dirs) {
      const fullPath = path.join(this.outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  private async generatePackageJson(): Promise<void> {
    const packageJson = {
      name: this.website.slug,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '^15.0.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        tailwindcss: '^4.0.0',
        'lucide-react': '^0.400.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        typescript: '^5.0.0'
      }
    };

    const filePath = path.join(this.outputDir, 'package.json');
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
  }

  private async generateNextConfig(): Promise<void> {
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ]
  }
};

module.exports = nextConfig;`;

    const filePath = path.join(this.outputDir, 'next.config.js');
    fs.writeFileSync(filePath, nextConfig);
  }

  private async generatePages(): Promise<void> {
    // Generate main page
    const pageContent = this.generatePageContent();
    const pagePath = path.join(this.outputDir, 'src/app/page.tsx');
    fs.writeFileSync(pagePath, pageContent);

    // Generate layout
    const layoutContent = this.generateLayoutContent();
    const layoutPath = path.join(this.outputDir, 'src/app/layout.tsx');
    fs.writeFileSync(layoutPath, layoutContent);
  }

  private generatePageContent(): string {
    const components = this.website.components
      .map((component, index) => {
        switch (component.type) {
          case 'hero':
            return `<Hero title="${component.title || ''}" subtitle="${component.subtitle || ''}" />`;
          case 'about':
            return `<About title="${component.title || ''}" text="${component.text || ''}" image="${component.image || ''}" />`;
          case 'gallery':
            return `<Gallery title="${component.title || ''}" images={${JSON.stringify(component.images || [])}} />`;
          case 'contact':
            return `<Contact title="${component.title || ''}" email="${component.email || ''}" text="${component.text || ''}" />`;
          default:
            return '';
        }
      })
      .join('\n      ');

    return `import Hero from '@/components/Hero';
import About from '@/components/About';
import Gallery from '@/components/Gallery';
import Contact from '@/components/Contact';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      ${components}
    </div>
  );
}`;
  }

  private generateLayoutContent(): string {
    return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${this.website.title}',
  description: 'Personal website for ${this.website.title}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
  }

  private async generateComponents(): Promise<void> {
    // Generate Hero component
    const heroComponent = `interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl opacity-90">{subtitle}</p>
      </div>
    </section>
  );
}`;

    fs.writeFileSync(
      path.join(this.outputDir, 'src/components/Hero.tsx'),
      heroComponent
    );

    // Generate About component
    const aboutComponent = `import Image from 'next/image';

interface AboutProps {
  title: string;
  text: string;
  image: string;
}

export default function About({ title, text, image }: AboutProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{text}</p>
            </div>
            {image && (
              <div className="relative h-64 md:h-80">
                <Image
                  src={image}
                  alt="About"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}`;

    fs.writeFileSync(
      path.join(this.outputDir, 'src/components/About.tsx'),
      aboutComponent
    );

    // Generate Gallery component
    const galleryComponent = `import Image from 'next/image';

interface GalleryProps {
  title: string;
  images: string[];
}

export default function Gallery({ title, images }: GalleryProps) {
  if (images.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="relative h-64 group overflow-hidden rounded-lg">
              <Image
                src={image}
                alt={\`Gallery image \${index + 1}\`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

    fs.writeFileSync(
      path.join(this.outputDir, 'src/components/Gallery.tsx'),
      galleryComponent
    );

    // Generate Contact component
    const contactComponent = `import { Mail } from 'lucide-react';

interface ContactProps {
  title: string;
  email: string;
  text: string;
}

export default function Contact({ title, email, text }: ContactProps) {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        {email && (
          <div className="flex items-center justify-center gap-2 text-lg">
            <Mail className="w-5 h-5" />
            <a 
              href={\`mailto:\${email}\`}
              className="hover:text-blue-400 transition-colors"
            >
              {email}
            </a>
          </div>
        )}
        {text && (
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">{text}</p>
        )}
      </div>
    </section>
  );
}`;

    fs.writeFileSync(
      path.join(this.outputDir, 'src/components/Contact.tsx'),
      contactComponent
    );
  }

  private async generateStyles(): Promise<void> {
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

a {
  color: inherit;
  text-decoration: none;
}`;

    fs.writeFileSync(
      path.join(this.outputDir, 'src/app/globals.css'),
      globalsCss
    );

    // Generate Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    fs.writeFileSync(
      path.join(this.outputDir, 'tailwind.config.js'),
      tailwindConfig
    );
  }
}
