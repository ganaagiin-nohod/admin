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
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct
} from '@/hooks/use-products';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PRODUCT_TYPES, ProductType } from '@/types/product';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Updated form schema to match GraphQL requirements
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
  type: z.enum(['drinks', 'appetizers', 'mains', 'desserts', 'sides'], {
    required_error: 'Product type is required.'
  }),
  price: z.number().min(0, {
    message: 'Price must be a positive number.'
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  }),
  definition: z.array(z.string()).min(1, {
    message: 'At least one definition is required.'
  })
});

type ProductFormProps = {
  productId?: string;
  initialData?: any | null;
  pageTitle: string;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  redirectPath?: string;
};

// Function to upload image and get URL (you'll need to implement this)
async function uploadImageToServer(file: File): Promise<string> {
  // This is a placeholder - implement your actual image upload logic
  // You might use a service like Cloudinary, AWS S3, or your own upload endpoint

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.imageUrl; // Assuming your upload endpoint returns { imageUrl: string }
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export default function ProductForm({
  productId,
  initialData,
  pageTitle,
  mode = 'create',
  onSuccess,
  redirectPath
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: fetchedProduct,
    loading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct
  } = useProduct(productId || '');

  const [createProduct] = useCreateProduct();
  const [updateProduct] = useUpdateProduct();

  const productData = initialData || fetchedProduct;

  const defaultValues = {
    title: '',
    type: undefined as ProductType | undefined,
    price: 0,
    description: '',
    definition: [''],
    image: undefined
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (productData) {
      form.reset({
        title: productData.title || '',
        type: (productData.type as ProductType) || undefined,
        price: productData.price || 0,
        description: productData.description || '',
        definition: productData.definition || [''],
        image: productData.image ? [] : undefined
      });
    }
  }, [productData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      let imageUrl = '';

      // Upload image if provided
      if (values.image && values.image.length > 0) {
        try {
          imageUrl = await uploadImageToServer(values.image[0]);
        } catch (uploadError) {
          toast.error('Failed to upload image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare the data for GraphQL mutation with correct field names
      const productInput = {
        title: values.title.trim(),
        type: values.type, // This should match your ProductType enum
        price: values.price,
        description: values.description.trim(),
        definition: values.definition.filter((def) => def.trim() !== ''), // Remove empty definitions
        image: imageUrl // Use 'image' not 'imageUrl'
      };

      console.log('Submitting product input:', productInput); // Debug log

      if (mode === 'edit' && productId) {
        const { data } = await updateProduct({
          variables: {
            id: productId,
            input: productInput
          }
        });

        if (data?.updateProduct) {
          toast.success('Product updated successfully!');
          onSuccess?.();
          if (redirectPath) {
            router.push(redirectPath);
          }
        }
      } else {
        const { data } = await createProduct({
          variables: {
            input: productInput
          }
        });

        if (data?.createProduct) {
          toast.success('Product created successfully!');
          form.reset(defaultValues);
          onSuccess?.();
          if (redirectPath) {
            router.push(redirectPath);
          }
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);

      // More specific error handling
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        toast.error(`GraphQL Error: ${graphQLError.message}`);
      } else if (error.networkError) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
                        maxFiles={1} // Changed to 1 since schema expects single image
                        maxSize={4 * 1024 * 1024}
                        disabled={isSubmitting}
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
                      <Input
                        placeholder='Enter product name'
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Changed from category to type */}
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select product type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
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
                        min='0'
                        placeholder='Enter price'
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                        }}
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
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add definition field */}
            <FormField
              control={form.control}
              name='definition'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Definitions</FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      {field.value.map((definition, index) => (
                        <div key={index} className='flex gap-2'>
                          <Input
                            placeholder={`Definition ${index + 1}`}
                            value={definition}
                            onChange={(e) => {
                              const newDefinitions = [...field.value];
                              newDefinitions[index] = e.target.value;
                              field.onChange(newDefinitions);
                            }}
                            disabled={isSubmitting}
                          />
                          {field.value.length > 1 && (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                const newDefinitions = field.value.filter(
                                  (_, i) => i !== index
                                );
                                field.onChange(newDefinitions);
                              }}
                              disabled={isSubmitting}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => field.onChange([...field.value, ''])}
                        disabled={isSubmitting}
                      >
                        Add Definition
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              disabled={isSubmitting || isLoadingProduct}
              className='w-full md:w-auto'
            >
              {isSubmitting
                ? mode === 'edit'
                  ? 'Updating...'
                  : 'Creating...'
                : mode === 'edit'
                  ? 'Update Product'
                  : 'Add Product'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
