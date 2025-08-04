'use client';

import React, { useState } from 'react';
import { X, Upload, Palette } from 'lucide-react';

interface SlideContent {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  backgroundImage?: string;
  image?: string;
  layout: 'title' | 'content' | 'image-left' | 'image-right' | 'image-center';
}

interface EditSlideModalProps {
  slide: SlideContent;
  onSave: () => void;
  onCancel: () => void;
  onChange: (slide: SlideContent) => void;
  backgroundOptions: string[];
}

export default function EditSlideModal({
  slide,
  onSave,
  onCancel,
  onChange,
  backgroundOptions
}: EditSlideModalProps) {
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const handleInputChange = (field: keyof SlideContent, value: string) => {
    onChange({ ...slide, [field]: value });
  };

  const handleImageUpload =
    (field: 'image' | 'backgroundImage') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange({ ...slide, [field]: result });
        };
        reader.readAsDataURL(file);
      }
    };

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4'>
      <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white'>
        <div className='flex items-center justify-between border-b p-6'>
          <h2 className='text-xl font-semibold'>Edit Slide</h2>
          <button
            onClick={onCancel}
            className='rounded-lg p-2 transition-colors hover:bg-gray-100'
          >
            <X size={20} />
          </button>
        </div>

        <div className='space-y-6 p-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Layout
            </label>
            <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
              {[
                { value: 'title', label: 'Title Slide' },
                { value: 'content', label: 'Content' },
                { value: 'image-left', label: 'Image Left' },
                { value: 'image-right', label: 'Image Right' },
                { value: 'image-center', label: 'Image Center' }
              ].map((layout) => (
                <button
                  key={layout.value}
                  onClick={() =>
                    handleInputChange('layout', layout.value as any)
                  }
                  className={`rounded-lg border p-3 text-sm transition-colors ${
                    slide.layout === layout.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Title
            </label>
            <input
              type='text'
              value={slide.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
              placeholder='Enter slide title'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Content
            </label>
            <textarea
              value={slide.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
              className='w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
              placeholder='Enter slide content'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Background
            </label>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                  className='flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50'
                >
                  <Palette size={16} />
                  Choose Color
                </button>
                <span className='text-sm text-gray-500'>or</span>
                <label className='flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50'>
                  <Upload size={16} />
                  Upload Image
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload('backgroundImage')}
                    className='hidden'
                  />
                </label>
              </div>

              {showBackgroundPicker && (
                <div className='grid grid-cols-3 gap-2 rounded-lg border bg-gray-50 p-3'>
                  {backgroundOptions.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleInputChange('backgroundColor', bg);
                        handleInputChange('backgroundImage', '');
                        setShowBackgroundPicker(false);
                      }}
                      className={`aspect-video rounded ${bg} border-2 transition-all ${
                        slide.backgroundColor === bg
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {slide.backgroundImage && (
                <div className='relative'>
                  <img
                    src={slide.backgroundImage}
                    alt='Background'
                    className='h-24 w-full rounded-lg object-cover'
                  />
                  <button
                    onClick={() => handleInputChange('backgroundImage', '')}
                    className='absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600'
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {['image-left', 'image-right', 'image-center'].includes(
            slide.layout
          ) && (
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Slide Image
              </label>
              <div className='space-y-3'>
                <label className='flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50'>
                  <Upload size={16} />
                  Upload Image
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload('image')}
                    className='hidden'
                  />
                </label>

                {slide.image && (
                  <div className='relative'>
                    <img
                      src={slide.image}
                      alt='Slide'
                      className='h-32 w-full rounded-lg object-cover'
                    />
                    <button
                      onClick={() => handleInputChange('image', '')}
                      className='absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600'
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-3 border-t bg-gray-50 p-6'>
          <button
            onClick={onCancel}
            className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
