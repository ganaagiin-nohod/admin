'use client';

import React, { useState } from 'react';
import PerfectPresentationBuilder from '@/components/presentation/PerfectPresentationBuilder';
import PresentationViewer from '@/components/presentation/PresentationViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastProvider, showToast } from '@/components/ui/toast';
import '@/styles/presentation-animations.css';

interface SlideContent {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  backgroundImage?: string;
  image?: string;
  layout: 'title' | 'content' | 'image-left' | 'image-right' | 'image-center';
}

export default function PresentationBuilderPage() {
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [activeTab, setActiveTab] = useState('builder');

  const handleSavePresentation = (presentationSlides: SlideContent[]) => {
    setSlides(presentationSlides);
    console.log('Presentation saved:', presentationSlides);
    showToast('Presentation saved successfully!', 'success');
  };

  return (
    <ToastProvider>
      <div className='h-screen overflow-y-auto bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50'>
        <div className='container mx-auto p-4 sm:p-6'>
          <div className='mb-4 text-center sm:mb-6'>
            <h1 className='mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl'>
              Presentations
            </h1>
            <p className='text-sm font-medium text-gray-600 sm:text-base'>
              Create stunning presentations with Canva-style editing • Click
              anywhere to edit
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full max-w-md grid-cols-2'>
              <TabsTrigger value='builder'>Builder</TabsTrigger>
              <TabsTrigger value='preview'>Preview</TabsTrigger>
            </TabsList>

            <TabsContent value='builder' className='mt-4 sm:mt-6'>
              <div className='overflow-hidden rounded-3xl border-4 border-violet-100 shadow-2xl'>
                <PerfectPresentationBuilder onSave={handleSavePresentation} />
              </div>
            </TabsContent>

            <TabsContent value='preview' className='mt-4 sm:mt-6'>
              <div className='rounded-lg border bg-white p-4 shadow-sm sm:p-6'>
                {slides.length > 0 ? (
                  <div>
                    <div className='mb-4'>
                      <h2 className='mb-2 text-xl font-semibold'>
                        Presentation Preview
                      </h2>
                      <p className='text-sm text-gray-600'>
                        Use arrow keys or click controls to navigate. Press F11
                        for fullscreen.
                      </p>
                    </div>
                    <PresentationViewer
                      slides={slides}
                      showControls={true}
                      autoPlay={false}
                    />
                  </div>
                ) : (
                  <div className='py-12 text-center'>
                    <div className='mb-4 text-gray-400'>
                      <svg
                        className='mx-auto h-12 w-12'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>
                    <h3 className='mb-2 text-lg font-medium text-gray-900'>
                      No presentation to preview
                    </h3>
                    <p className='mb-4 text-gray-500'>
                      Create and save a presentation in the Builder tab to see
                      it here.
                    </p>
                    <button
                      onClick={() => setActiveTab('builder')}
                      className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                    >
                      Go to Builder
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToastProvider>
  );
}
