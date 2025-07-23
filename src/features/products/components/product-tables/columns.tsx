'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Product } from '@/constants/data';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'image',
    header: 'IMAGE',
    cell: ({ row }) => {
      const imageUrl =
        (row.getValue('image') as string) || row.original.photo_url;
      const title = row.original.title || row.original.name || 'Product';

      // Simple placeholder image URL - you can replace this with your own placeholder
      const placeholderImage =
        'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image';

      return (
        <div className='relative aspect-square h-16 w-16 overflow-hidden rounded-lg bg-gray-100'>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className='object-cover'
              sizes='64px'
              onError={(e) => {
                // Hide the image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-xs text-gray-400'>
              No Image
            </div>
          )}
        </div>
      );
    }
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const title = row.original.title || row.original.name;
      return <div className='font-medium'>{title}</div>;
    },
    meta: {
      label: 'Name',
      placeholder: 'Search products...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => {
      const type = row.original.type || row.original.category;
      return (
        <Badge variant='outline' className='capitalize'>
          {type}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'categories',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS
    }
  },
  {
    id: 'isAvailable',
    accessorKey: 'isAvailable',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isAvailable = row.original.isAvailable;
      const Icon = isAvailable ? CheckCircle2 : XCircle;
      return (
        <Badge
          variant={isAvailable ? 'default' : 'secondary'}
          className='capitalize'
        >
          <Icon className='mr-1 h-3 w-3' />
          {isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'status',
      variant: 'select',
      options: [
        { label: 'Available', value: 'true' },
        { label: 'Unavailable', value: 'false' }
      ]
    }
  },
  {
    accessorKey: 'price',
    header: 'PRICE'
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION'
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
