import { IWebsite } from '@/models/Website';
import Hero from './Hero';
import About from './About';
import Gallery from './Gallery';
import Contact from './Contact';
import Products from './Products';

interface WebsiteRendererProps {
  website: IWebsite;
}

export default function WebsiteRenderer({ website }: WebsiteRendererProps) {
  return (
    <div className='min-h-screen'>
      {website.components.map((component, index) => {
        switch (component.type) {
          case 'hero':
            return <Hero key={index} component={component} />;
          case 'about':
            return <About key={index} component={component} />;
          case 'gallery':
            return <Gallery key={index} component={component} />;
          case 'contact':
            return <Contact key={index} component={component} />;
          case 'products':
            return <Products key={index} component={component} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
