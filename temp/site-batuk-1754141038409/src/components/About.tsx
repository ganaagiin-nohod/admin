import Image from 'next/image';

interface AboutProps {
  title: string;
  text: string;
  image: string;
}

export default function About({ title, text, image }: AboutProps) {
  return (
    <section className='bg-gray-50 py-16'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <div className='grid items-center gap-8 md:grid-cols-2'>
            <div>
              <h2 className='mb-6 text-3xl font-bold text-gray-800'>{title}</h2>
              <p className='leading-relaxed text-gray-600'>{text}</p>
            </div>
            {image && (
              <div className='relative h-64 md:h-80'>
                <Image
                  src={image}
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
