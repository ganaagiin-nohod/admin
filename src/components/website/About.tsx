import { IWebsiteComponent } from '@/models/Website';
import Image from 'next/image';

interface AboutProps {
  component: IWebsiteComponent;
}

export default function About({ component }: AboutProps) {
  return (
    <section className='bg-gray-50 py-16'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='grid items-center gap-8 md:grid-cols-2'>
            <div>
              <h2 className='mb-6 text-3xl font-bold text-gray-800'>
                {component.title || 'About Me'}
              </h2>
              <p className='leading-relaxed text-gray-600'>
                {component.text || 'Tell your story here...'}
              </p>
            </div>
            {component.image && (
              <div className='relative h-64 md:h-80'>
                <Image
                  src={component.image}
                  alt='About'
                  fill
                  className='rounded-lg object-cover'
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
