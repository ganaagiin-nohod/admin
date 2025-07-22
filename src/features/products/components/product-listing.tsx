'use client';

import { Product } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';
import { useAllProducts } from '@/hooks/use-products';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

type ProductListingPage = {};

export default function ProductListingPage({}: ProductListingPage) {
  const { data, loading, error } = useAllProducts();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('name') || '';
  const pageLimit = searchParams.get('perPage') || '10';
  const categories = searchParams.get('category') || '';

  const filters = useMemo(
    () => ({
      page: parseInt(page),
      limit: parseInt(pageLimit),
      ...(search && { search }),
      ...(categories && { categories: categories.split(',') })
    }),
    [page, pageLimit, search, categories]
  );

  if (loading) {
    return <div className='flex justify-center p-8'>Loading products...</div>;
  }

  if (error) {
    return (
      <div className='flex justify-center p-8 text-red-500'>
        Error loading products: {error.message}
      </div>
    );
  }

  const products: Product[] = (data?.allProducts || []).map((product: any) => ({
    ...product,
    photo_url: product.image,
    name: product.title,
    created_at: product.createdAt,
    category: product.type,
    updated_at: product.updatedAt
  }));
  const totalProducts = products.length;

  return (
    <ProductTable
      data={products}
      totalItems={totalProducts}
      columns={columns}
    />
  );
}
