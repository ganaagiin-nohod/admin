import { IWebsiteComponent } from '@/models/Website';

interface HeroProps {
  component: IWebsiteComponent;
}

export default function Hero({ component }: HeroProps) {
  return (
    <section className='bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white'>
      <div className='container mx-auto px-4 text-center'>
        <h1 className='mb-4 text-5xl font-bold'>
          {component.title || 'Welcome to My Site'}
        </h1>
        <p className='text-xl opacity-90'>
          {component.subtitle || 'This is my personal website'}
        </p>
      </div>
    </section>
  );
}
