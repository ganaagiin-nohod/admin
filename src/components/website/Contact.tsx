import { IWebsiteComponent } from '@/models/Website';
import { Mail } from 'lucide-react';

interface ContactProps {
  component: IWebsiteComponent;
}

export default function Contact({ component }: ContactProps) {
  return (
    <section className='bg-gray-900 py-16 text-white'>
      <div className='container mx-auto px-4 text-center'>
        <h2 className='mb-8 text-3xl font-bold'>
          {component.title || 'Contact Me'}
        </h2>
        {component.email && (
          <div className='flex items-center justify-center gap-2 text-lg'>
            <Mail className='h-5 w-5' />
            <a
              href={`mailto:${component.email}`}
              className='transition-colors hover:text-blue-400'
            >
              {component.email}
            </a>
          </div>
        )}
        {component.text && (
          <p className='mx-auto mt-4 max-w-2xl text-gray-300'>
            {component.text}
          </p>
        )}
      </div>
    </section>
  );
}
