import Image from 'next/image';

interface GalleryProps {
  title: string;
  images: string[];
}

export default function Gallery({ title, images }: GalleryProps) {
  if (images.length === 0) return null;

  return (
    <section className='py-16'>
      <div className='container mx-auto px-4'>
        <h2 className='mb-8 text-center text-3xl font-bold text-gray-800'>
          {title}
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {images.map((image, index) => (
            <div
              key={index}
              className='group relative h-64 overflow-hidden rounded-lg'
            >
              <Image
                src={image}
                alt={`Gallery image ${index + 1}`}
                fill
                className='object-cover transition-transform group-hover:scale-105'
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
