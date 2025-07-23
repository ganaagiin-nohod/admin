'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';
import { useProduct } from '@/hooks/use-products';

type TProductViewPageProps = {
  productId: string;
};

export default function ProductViewPage({ productId }: TProductViewPageProps) {
  const [pageTitle, setPageTitle] = useState('Create New Product');

  // Skip query if productId is 'new'
  const { data, loading, error } = useProduct(productId);

  useEffect(() => {
    if (productId === 'new') {
      setPageTitle('Create New Product');
    } else if (data?.product) {
      setPageTitle('Edit Product');
    }
  }, [productId, data]);

  // Handle loading state
  if (productId !== 'new' && loading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (error) {
    console.error('Error loading product:', error);
    notFound();
  }

  // Handle not found
  if (productId !== 'new' && !loading && !data?.product) {
    notFound();
  }

  const product = productId === 'new' ? null : data?.product;

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
