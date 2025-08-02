import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Globe, Palette, Zap } from 'lucide-react';

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard/overview');
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Header */}
      <header className='container mx-auto px-4 py-6'>
        <nav className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Globe className='h-8 w-8 text-blue-600' />
            <span className='text-2xl font-bold text-gray-900'>
              SiteBuilder
            </span>
          </div>
          <div className='space-x-4'>
            <Link href='/auth/sign-in'>
              <Button variant='ghost'>Sign In</Button>
            </Link>
            <Link href='/auth/sign-up'>
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className='container mx-auto px-4 py-20'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='mb-6 text-5xl font-bold text-gray-900 md:text-6xl'>
            Build Your Personal Website in
            <span className='text-blue-600'> Minutes</span>
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-600'>
            Create stunning personal websites without writing a single line of
            code. Just fill out a form, upload your images, and share your story
            with the world.
          </p>

          <div className='mb-16 flex flex-col justify-center gap-4 sm:flex-row'>
            <Link href='/auth/sign-up'>
              <Button size='lg' className='px-8 py-3 text-lg'>
                Start Building Now
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </Link>
            <Link href='/site/demo-portfolio'>
              <Button size='lg' variant='outline' className='px-8 py-3 text-lg'>
                View Demo Site
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className='mt-20 grid gap-8 md:grid-cols-3'>
            <div className='p-6 text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                <Zap className='h-8 w-8 text-blue-600' />
              </div>
              <h3 className='mb-2 text-xl font-semibold'>Lightning Fast</h3>
              <p className='text-gray-600'>
                Create your website in minutes with our intuitive form-based
                builder.
              </p>
            </div>

            <div className='p-6 text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                <Palette className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='mb-2 text-xl font-semibold'>Beautiful Design</h3>
              <p className='text-gray-600'>
                Professional templates that look great on all devices
                automatically.
              </p>
            </div>

            <div className='p-6 text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100'>
                <Globe className='h-8 w-8 text-purple-600' />
              </div>
              <h3 className='mb-2 text-xl font-semibold'>Instant Publishing</h3>
              <p className='text-gray-600'>
                Your site goes live immediately with a custom URL you can share
                anywhere.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='container mx-auto px-4 py-8 text-center text-gray-600'>
        <p>
          &copy; 2025 SiteBuilder. Built with Next.js, MongoDB, and Cloudinary.
        </p>
      </footer>
    </div>
  );
}
