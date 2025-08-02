import Gallery from '../components/Gallery';
import Hero from '../components/Hero';

export default function HomePage() {
  return (
    <div className='min-h-screen'>
      <Hero
        title='Welcome to Batuk Site'
        subtitle='This is my personal website'
      />
      <Gallery
        title='Gallery'
        images={[
          'https://res.cloudinary.com/dmitewgkw/image/upload/v1754140935/website-builder/user_30CPdiVB2wujMsHONphLXok6anK/focko6wwvmerd5k2ajyu.jpg'
        ]}
      />
    </div>
  );
}
