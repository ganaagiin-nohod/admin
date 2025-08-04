'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Image as ImageIcon
} from 'lucide-react';

interface SlideContent {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  backgroundImage?: string;
  image?: string;
  layout: 'title' | 'content' | 'image-left' | 'image-right' | 'image-center';
}

interface PresentationViewerProps {
  slides: SlideContent[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
}

export default function PresentationViewer({
  slides,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true
}: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const resetPresentation = useCallback(() => {
    setCurrentSlide(0);
    setIsPlaying(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        if (next === 0) {
          setIsPlaying(false);
        }
        return next;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length, autoPlayInterval]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide, goToSlide, slides.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (slides.length === 0) {
    return (
      <div className='flex h-96 w-full items-center justify-center bg-gray-100'>
        <p className='text-gray-500'>No slides to display</p>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96 w-full md:h-[600px]'}`}
    >
      <div className='relative h-full w-full overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className='absolute inset-0'
          >
            <SlideDisplay slide={slides[currentSlide]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {showControls && (
        <>
          <button
            onClick={prevSlide}
            className='bg-opacity-50 hover:bg-opacity-75 absolute top-1/2 left-4 -translate-y-1/2 transform rounded-full bg-black p-3 text-white opacity-0 transition-all group-hover:opacity-100 hover:opacity-100'
            disabled={slides.length <= 1}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className='bg-opacity-50 hover:bg-opacity-75 absolute top-1/2 right-4 -translate-y-1/2 transform rounded-full bg-black p-3 text-white opacity-0 transition-all group-hover:opacity-100 hover:opacity-100'
            disabled={slides.length <= 1}
          >
            <ChevronRight size={24} />
          </button>

          <div className='bg-opacity-50 absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-4 rounded-full bg-black px-4 py-2 text-white opacity-0 transition-opacity hover:opacity-100'>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className='hover:bg-opacity-20 rounded-full p-2 transition-colors hover:bg-white'
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button
              onClick={resetPresentation}
              className='hover:bg-opacity-20 rounded-full p-2 transition-colors hover:bg-white'
            >
              <RotateCcw size={16} />
            </button>

            <div className='text-sm'>
              {currentSlide + 1} / {slides.length}
            </div>

            <button
              onClick={toggleFullscreen}
              className='hover:bg-opacity-20 rounded-full p-2 transition-colors hover:bg-white'
            >
              <Maximize size={16} />
            </button>
          </div>

          <div className='bg-opacity-30 absolute bottom-0 left-0 h-1 w-full bg-black'>
            <div
              className='h-full bg-white transition-all duration-300'
              style={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`
              }}
            />
          </div>

          <div className='absolute bottom-8 left-1/2 flex -translate-x-1/2 transform gap-2 opacity-0 transition-opacity hover:opacity-100'>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'bg-white'
                    : 'bg-opacity-50 hover:bg-opacity-75 bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface SlideDisplayProps {
  slide: SlideContent;
}

function SlideDisplay({ slide }: SlideDisplayProps) {
  const renderContent = () => {
    switch (slide.layout) {
      case 'title':
        return (
          <div className='text-center'>
            <h1 className='mb-6 text-3xl font-bold md:text-5xl lg:text-6xl'>
              {slide.title}
            </h1>
            <p className='mx-auto max-w-4xl text-base leading-relaxed opacity-90 md:text-lg lg:text-xl'>
              {slide.content}
            </p>
          </div>
        );

      case 'image-left':
        return (
          <div className='grid h-full items-center gap-6 md:grid-cols-2 lg:gap-8'>
            <div className='order-2 md:order-1'>
              {slide.image ? (
                <img
                  src={slide.image}
                  alt=''
                  className='h-48 w-full rounded-lg object-cover shadow-lg md:h-64 lg:h-80'
                />
              ) : (
                <div className='bg-opacity-20 flex h-48 w-full items-center justify-center rounded-lg bg-white md:h-64 lg:h-80'>
                  <ImageIcon size={48} className='opacity-50' />
                </div>
              )}
            </div>
            <div className='order-1 md:order-2'>
              <h2 className='mb-4 text-2xl font-bold md:text-3xl lg:text-4xl'>
                {slide.title}
              </h2>
              <p className='text-base leading-relaxed opacity-90 md:text-lg'>
                {slide.content}
              </p>
            </div>
          </div>
        );

      case 'image-right':
        return (
          <div className='grid h-full items-center gap-6 md:grid-cols-2 lg:gap-8'>
            <div>
              <h2 className='mb-4 text-2xl font-bold md:text-3xl lg:text-4xl'>
                {slide.title}
              </h2>
              <p className='text-base leading-relaxed opacity-90 md:text-lg'>
                {slide.content}
              </p>
            </div>
            <div>
              {slide.image ? (
                <img
                  src={slide.image}
                  alt=''
                  className='h-48 w-full rounded-lg object-cover shadow-lg md:h-64 lg:h-80'
                />
              ) : (
                <div className='bg-opacity-20 flex h-48 w-full items-center justify-center rounded-lg bg-white md:h-64 lg:h-80'>
                  <ImageIcon size={48} className='opacity-50' />
                </div>
              )}
            </div>
          </div>
        );

      case 'image-center':
        return (
          <div className='text-center'>
            <h2 className='mb-6 text-2xl font-bold md:text-3xl lg:text-4xl'>
              {slide.title}
            </h2>
            {slide.image ? (
              <img
                src={slide.image}
                alt=''
                className='mx-auto mb-6 h-48 w-full max-w-3xl rounded-lg object-cover shadow-lg md:h-64 lg:h-80'
              />
            ) : (
              <div className='bg-opacity-20 mx-auto mb-6 flex h-48 w-full max-w-3xl items-center justify-center rounded-lg bg-white md:h-64 lg:h-80'>
                <ImageIcon size={48} className='opacity-50' />
              </div>
            )}
            <p className='mx-auto max-w-4xl text-base leading-relaxed opacity-90 md:text-lg'>
              {slide.content}
            </p>
          </div>
        );

      default:
        return (
          <div>
            <h2 className='mb-6 text-2xl font-bold md:text-3xl lg:text-4xl'>
              {slide.title}
            </h2>
            <p className='max-w-4xl text-base leading-relaxed opacity-90 md:text-lg lg:text-xl'>
              {slide.content}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className={`h-full w-full ${slide.backgroundColor} group relative text-white`}
    >
      {slide.backgroundImage && (
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url(${slide.backgroundImage})` }}
        >
          <div className='bg-opacity-40 absolute inset-0 bg-black'></div>
        </div>
      )}

      <div className='relative z-10 flex h-full items-center justify-center p-6 md:p-12 lg:p-16'>
        <div className='w-full max-w-6xl'>{renderContent()}</div>
      </div>
    </div>
  );
}
