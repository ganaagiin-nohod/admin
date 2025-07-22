'use client';

import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAllProducts, useProduct } from '@/hooks/use-products';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const formSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length == 1, 'Image is required.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  title: z.string().min(2, {
    message: 'Product name must be at least 2 characters.'
  }),
  category: z.string(),
  price: z.number(),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  })
});

type ProductFormProps = {
  productId?: string; // For editing existing products
  initialData?: any | null; // For direct data passing (optional)
  pageTitle: string;
  mode?: 'create' | 'edit';
};

export default function ProductForm({
  productId,
  initialData,
  pageTitle,
  mode = 'create'
}: ProductFormProps) {
  // Use useProduct hook when we have a productId (for editing)
  const {
    data: fetchedProduct,
    loading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct
  } = useProduct(productId || '');

  // Determine which product data to use
  const productData = initialData || fetchedProduct;

  const defaultValues = {
    name: '',
    category: '',
    price: 0,
    description: ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  // Update form when product data is loaded
  useEffect(() => {
    if (productData) {
      form.reset({
        title: productData.title || '',
        category: productData.category || '',
        price: productData.price || 0,
        description: productData.description || '',
        // Note: image field handling would depend on your FileUploader implementation
        // You might need to convert existing image URLs to the expected format
        image: productData.imageUrl ? [] : undefined // Adjust based on your needs
      });
    }
  }, [productData, form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (mode === 'edit' && productId) {
        // Update existing product
        console.log('Updating product:', productId, values);
        // Call your update mutation here
        // await updateProduct({ id: productId, ...values });
      } else {
        // Create new product
        console.log('Creating new product:', values);
        // Call your create mutation here
        // await createProduct(values);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }

  // Handle loading state
  if (mode === 'edit' && productId && isLoadingProduct) {
    return (
      <Card className='mx-auto w-full'>
        <CardHeader>
          <Skeleton className='h-8 w-64' />
        </CardHeader>
        <CardContent className='space-y-6'>
          <Skeleton className='h-32 w-full' />
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-10 w-32' />
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (mode === 'edit' && productId && productError) {
    return (
      <Card className='mx-auto w-full'>
        <CardContent className='py-8'>
          <div className='space-y-4 text-center'>
            <p className='text-red-500'>
              Error loading product: {productError.message}
            </p>
            <Button onClick={refetchProduct} variant='outline'>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={4}
                        maxSize={4 * 1024 * 1024}
                        // disabled={loading}
                        // progresses={progresses}
                        // pass the onUpload function here for direct upload
                        // onUpload={uploadFiles}
                        // disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter product name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select categories' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='beauty'>Beauty Products</SelectItem>
                        <SelectItem value='electronics'>Electronics</SelectItem>
                        <SelectItem value='clothing'>Clothing</SelectItem>
                        <SelectItem value='home'>Home & Garden</SelectItem>
                        <SelectItem value='sports'>
                          Sports & Outdoors
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='Enter price'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter product description'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isLoadingProduct}>
              {mode === 'edit' ? 'Update Product' : 'Add Product'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
