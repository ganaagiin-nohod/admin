import { IWebsiteComponent } from '@/models/Website';
import Image from 'next/image';

interface ProductsProps {
  component: IWebsiteComponent;
}

export default function Products({ component }: ProductsProps) {
  const products = component.products || [];

  if (products.length === 0) {
    return (
      <section className='bg-gray-50 py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='mb-6 text-3xl font-bold text-gray-800'>
            {component.title || 'Products'}
          </h2>
          <p className='text-gray-600'>No products to display</p>
        </div>
      </section>
    );
  }

  return (
    <section className='bg-gray-50 py-16'>
      <div className='container mx-auto px-4'>
        <h2 className='mb-8 text-center text-3xl font-bold text-gray-800'>
          {component.title || 'Products'}
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {products.map((product, index) => (
            <div
              key={index}
              className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg'
            >
              {product.image && (
                <div className='relative h-48'>
                  <Image
                    src={product.image}
                    alt={product.name || 'Product'}
                    fill
                    className='object-cover'
                  />
                </div>
              )}
              <div className='p-6'>
                <h3 className='mb-2 text-xl font-semibold text-gray-800'>
                  {product.name || 'Product'}
                </h3>
                <p className='mb-4 text-sm text-gray-600'>
                  {product.description || ''}
                </p>
                <div className='flex items-center justify-between'>
                  <span className='text-2xl font-bold text-green-600'>
                    ${product.price || 0}
                  </span>
                  {product.link && (
                    <a
                      href={product.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700'
                    >
                      Buy Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
