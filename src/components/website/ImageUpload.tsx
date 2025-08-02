'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  multiple?: boolean;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  label = 'Upload Image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPreview(data.url);
      onChange(data.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>

      <div className='rounded-lg border-2 border-dashed border-gray-300 p-4'>
        {preview ? (
          <div className='relative'>
            <div className='relative mb-2 h-48 w-full'>
              <Image
                src={preview}
                alt='Preview'
                fill
                className='rounded object-cover'
              />
            </div>
            <div className='flex items-center justify-between'>
              <p className='mr-2 flex-1 truncate text-sm text-gray-600'>
                {preview}
              </p>
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ) : (
          <div className='text-center'>
            <div className='flex flex-col items-center justify-center py-8'>
              <Upload className='mb-2 h-8 w-8 text-gray-400' />
              <p className='mb-2 text-sm text-gray-600'>
                Click to upload or drag and drop
              </p>
              <p className='text-xs text-gray-400'>PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        )}

        <Button
          type='button'
          variant='outline'
          onClick={handleClick}
          disabled={uploading}
          className='mt-2 w-full'
        >
          {uploading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Uploading...
            </>
          ) : (
            <>
              <Upload className='mr-2 h-4 w-4' />
              {preview ? 'Change Image' : 'Select Image'}
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileSelect}
          className='hidden'
          multiple={multiple}
        />
      </div>
    </div>
  );
}
