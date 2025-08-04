'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  Download,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Zap,
  Eye,
  Volume2,
  VolumeX,
  Type,
  MousePointer,
  Save
} from 'lucide-react';
import PresentationViewer from './PresentationViewer';
import AIPresentationDialog from './AIPresentationDialog';
import EditSlideModal from './EditSlideModal';

interface SlideContent {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  backgroundImage?: string;
  image?: string;
  layout: 'title' | 'content' | 'image-left' | 'image-right' | 'image-center';
}

interface PresentationBuilderProps {
  onSave?: (slides: SlideContent[]) => void;
}

const defaultSlides: SlideContent[] = [
  {
    id: '1',
    title: 'Welcome to the Future',
    content:
      'Experience presentations like never before. This is where innovation meets creativity in the most spectacular way possible.',
    backgroundColor: 'bg-white',
    layout: 'title'
  },
  {
    id: '2',
    title: 'Revolutionary Design',
    content:
      'Every element is crafted with precision. From smooth animations to stunning visual effects, this is presentation perfection.',
    backgroundColor: 'bg-gray-50',
    layout: 'content'
  }
];

export default function PerfectPresentationBuilder({
  onSave
}: PresentationBuilderProps) {
  const [slides, setSlides] = useState<SlideContent[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideContent | null>(null);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [editingText, setEditingText] = useState<{
    slideId: string;
    field: 'title' | 'content';
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        if (next === 0) setIsPlaying(false);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const addSlide = useCallback(() => {
    const colors = ['bg-white', 'bg-gray-50'];
    const newSlide: SlideContent = {
      id: Date.now().toString(),
      title: 'New Slide',
      content: 'Click here to edit your content and make it amazing!',
      backgroundColor: colors[slides.length % colors.length],
      layout: 'content'
    };
    setSlides((prev) => [...prev, newSlide]);
    setCurrentSlide(slides.length);
  }, [slides.length]);

  const deleteSlide = useCallback(
    (slideId: string) => {
      if (slides.length <= 1) return;
      setSlides((prev) => prev.filter((slide) => slide.id !== slideId));
      if (currentSlide >= slides.length - 1) {
        setCurrentSlide(Math.max(0, currentSlide - 1));
      }
    },
    [slides.length, currentSlide]
  );

  const updateSlide = useCallback(
    (slideId: string, updates: Partial<SlideContent>) => {
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === slideId ? { ...slide, ...updates } : slide
        )
      );
    },
    []
  );

  const startEditing = useCallback((slide: SlideContent) => {
    setEditingSlide({ ...slide });
    setIsEditing(true);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingSlide) return;
    setSlides((prev) =>
      prev.map((slide) => (slide.id === editingSlide.id ? editingSlide : slide))
    );
    setIsEditing(false);
    setEditingSlide(null);
  }, [editingSlide]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingSlide(null);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    if (soundEnabled) {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
      );
      audio.volume = 0.1;
      audio.play().catch(() => {});
    }
  }, [slides.length, soundEnabled]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleAIGenerate = useCallback((aiSlides: SlideContent[]) => {
    setSlides(aiSlides);
    setCurrentSlide(0);
    setShowAiDialog(false);
    setAiGenerating(false);
  }, []);

  const exportToPDF = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('toast', {
          detail: {
            message: '🎨 Creating your PDF masterpiece...',
            type: 'success'
          }
        });
        window.dispatchEvent(event);
      }
      const jsPDF = (await import('jspdf')).jsPDF;
      const pdf = new jsPDF('landscape', 'mm', 'a4');

      slides.forEach((slide, index) => {
        if (index > 0) pdf.addPage();

        if (slide.backgroundColor === 'bg-white') {
          pdf.setFillColor(255, 255, 255);
        } else {
          pdf.setFillColor(249, 250, 251);
        }
        pdf.rect(0, 0, 297, 210, 'F');

        pdf.setTextColor(17, 24, 39);
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        const titleLines = pdf.splitTextToSize(slide.title, 250);
        const titleY = 70;
        titleLines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, 148.5, titleY + lineIndex * 12, { align: 'center' });
        });

        pdf.setTextColor(55, 65, 81);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        const contentLines = pdf.splitTextToSize(slide.content, 250);
        const contentY = titleY + titleLines.length * 12 + 20;
        contentLines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, 148.5, contentY + lineIndex * 8, { align: 'center' });
        });

        pdf.setTextColor(156, 163, 175);
        pdf.setFontSize(12);
        pdf.text(`${index + 1} / ${slides.length}`, 148.5, 190, {
          align: 'center'
        });
      });

      pdf.save('presentation.pdf');

      if (typeof window !== 'undefined') {
        const event = new CustomEvent('toast', {
          detail: { message: '🎉 PDF exported successfully!', type: 'success' }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('toast', {
          detail: {
            message: 'Failed to export PDF. Please try again.',
            type: 'error'
          }
        });
        window.dispatchEvent(event);
      }
    }
  }, [slides]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const togglePlayMode = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const backgroundOptions = ['bg-white', 'bg-gray-50', 'bg-gray-100'];

  return (
    <div className='relative flex min-h-screen w-full flex-col bg-gray-50'>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='relative z-10 border-b border-gray-200/50 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6'
      >
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0'>
          <div className='flex items-center gap-3'>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-lg'
            >
              <Zap className='h-6 w-6 text-white' />
            </motion.div>
            <div>
              <h1 className='text-xl font-bold text-gray-900 sm:text-2xl'>
                Presentations
              </h1>
              <p className='text-xs text-gray-600'>Click anywhere to edit</p>
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAiDialog(true);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-lg transition-all ${
                aiGenerating
                  ? 'cursor-not-allowed bg-gray-600'
                  : 'bg-gray-900 hover:bg-gray-800'
              } text-white`}
              disabled={aiGenerating}
            >
              {aiGenerating ? (
                <>
                  <div className='h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                  <span className='hidden sm:inline'>Generating...</span>
                  <span className='sm:hidden'>🤖</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span className='hidden sm:inline'>AI Magic</span>
                  <span className='sm:hidden'>🤖</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToPDF}
              className='flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-green-700'
            >
              <Download size={14} />
              <span className='hidden sm:inline'>Export PDF</span>
              <span className='sm:hidden'>📄</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayMode}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-lg transition-all ${
                isPlaying ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span className='hidden sm:inline'>
                {isPlaying ? 'Stop' : 'Present'}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className='rounded-xl bg-gray-700 p-2 text-white shadow-lg transition-all hover:bg-gray-800'
            >
              <Maximize2 size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addSlide}
              className='flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50'
            >
              <Plus size={14} />
              <span className='hidden sm:inline'>Add Slide</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave?.(slides)}
              className='flex items-center gap-2 rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-300'
            >
              <Save size={14} />
              <span className='hidden sm:inline'>Save</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className='relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row'>
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='max-h-48 w-full border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl lg:max-h-none lg:w-80 lg:border-r lg:border-b-0'
        >
          <div className='h-full max-h-[calc(100vh-200px)] overflow-y-auto p-6'>
            <h3 className='mb-6 flex items-center gap-2 font-bold text-gray-800'>
              <Eye size={16} className='text-blue-500' /> Slides (
              {slides.length})
            </h3>
            <div className='flex gap-4 overflow-x-auto lg:flex-col lg:space-y-0 lg:overflow-x-visible'>
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative w-40 flex-shrink-0 cursor-pointer rounded-2xl border-2 shadow-lg transition-all lg:w-auto ${
                    currentSlide === index
                      ? 'border-blue-400 shadow-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <div
                    className={`aspect-video rounded-2xl ${slide.backgroundColor} relative overflow-hidden p-4 text-xs text-gray-900`}
                  >
                    <div className='absolute inset-0 bg-gradient-to-t from-black/5 to-transparent'></div>
                    <div className='relative z-10'>
                      <div className='truncate text-sm font-bold'>
                        {slide.title}
                      </div>
                      <div className='mt-2 line-clamp-2 hidden text-xs leading-relaxed opacity-75 lg:block'>
                        {slide.content}
                      </div>
                    </div>
                  </div>
                  <div className='absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(slide);
                      }}
                      className='rounded-lg bg-white/90 p-1.5 text-gray-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-gray-100'
                    >
                      <Edit3 size={12} />
                    </motion.button>
                    {slides.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(slide.id);
                        }}
                        className='rounded-lg bg-red-500 p-1.5 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-red-600'
                      >
                        <Trash2 size={12} />
                      </motion.button>
                    )}
                  </div>
                  <div className='absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-gray-700 backdrop-blur-sm'>
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className='relative flex-1 bg-gray-100'>
          <div className='h-full overflow-y-auto' ref={containerRef}>
            <div className='flex min-h-full items-center justify-center p-4'>
              <div
                className='relative aspect-video w-full max-w-6xl'
                ref={slideRef}
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 1.1, rotateY: -45 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className='absolute inset-0 overflow-hidden rounded-3xl shadow-2xl'
                  >
                    <CanvaStyleSlideRenderer
                      slide={slides[currentSlide]}
                      onUpdate={(updates) =>
                        updateSlide(slides[currentSlide].id, updates)
                      }
                      isPlaying={isPlaying}
                      editingText={editingText}
                      setEditingText={setEditingText}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className='absolute top-1/2 left-6 -translate-y-1/2 transform rounded-full border border-gray-200 bg-white/90 p-4 text-gray-700 shadow-xl backdrop-blur-sm transition-all hover:bg-gray-100'
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className='absolute top-1/2 right-6 -translate-y-1/2 transform rounded-full border border-gray-200 bg-white/90 p-4 text-gray-700 shadow-xl backdrop-blur-sm transition-all hover:bg-gray-100'
          >
            <ChevronRight size={24} />
          </motion.button>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='absolute bottom-6 left-1/2 flex -translate-x-1/2 transform items-center gap-4 rounded-2xl border border-gray-200/50 bg-white/90 px-6 py-3 text-gray-800 shadow-xl backdrop-blur-xl'
          >
            <div className='text-sm font-bold text-gray-700'>
              {currentSlide + 1} / {slides.length}
            </div>
            <div className='h-4 w-px bg-gray-300'></div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`rounded-lg p-2 transition-colors ${
                soundEnabled
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentSlide(0)}
              className='rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200'
            >
              <RotateCcw size={16} />
            </motion.button>
          </motion.div>

          <div className='absolute bottom-0 left-0 h-2 w-full bg-gray-200/50'>
            <motion.div
              className='h-full rounded-full bg-blue-500'
              initial={{ width: 0 }}
              animate={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className='fixed inset-0 z-50 bg-black'>
          <PresentationViewer
            slides={slides}
            autoPlay={isPlaying}
            autoPlayInterval={5000}
            showControls={true}
          />
        </div>
      )}

      {isEditing && editingSlide && (
        <EditSlideModal
          slide={editingSlide}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onChange={setEditingSlide}
          backgroundOptions={backgroundOptions}
        />
      )}

      <AIPresentationDialog
        open={showAiDialog}
        onOpenChange={(open) => {
          setShowAiDialog(open);
          if (!open) setAiGenerating(false);
        }}
        onGenerate={handleAIGenerate}
        generating={aiGenerating}
        onGeneratingChange={setAiGenerating}
      />
    </div>
  );
}

function CanvaStyleSlideRenderer({
  slide,
  onUpdate,
  isPlaying,
  editingText,
  setEditingText
}: {
  slide: SlideContent;
  onUpdate: (updates: Partial<SlideContent>) => void;
  isPlaying: boolean;
  editingText: { slideId: string; field: 'title' | 'content' } | null;
  setEditingText: (
    editing: { slideId: string; field: 'title' | 'content' } | null
  ) => void;
}) {
  const [tempTitle, setTempTitle] = useState(slide.title);
  const [tempContent, setTempContent] = useState(slide.content);

  React.useEffect(() => {
    setTempTitle(slide.title);
    setTempContent(slide.content);
  }, [slide]);

  const handleTextClick = (field: 'title' | 'content') => {
    if (isPlaying) return;
    setEditingText({ slideId: slide.id, field });
  };

  const handleTextSave = (field: 'title' | 'content') => {
    if (field === 'title') {
      onUpdate({ title: tempTitle });
    } else {
      onUpdate({ content: tempContent });
    }
    setEditingText(null);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    field: 'title' | 'content'
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSave(field);
    } else if (e.key === 'Escape') {
      setEditingText(null);
      if (field === 'title') setTempTitle(slide.title);
      else setTempContent(slide.content);
    }
  };

  const renderContent = () => {
    const isEditingTitle =
      editingText?.slideId === slide.id && editingText?.field === 'title';
    const isEditingContent =
      editingText?.slideId === slide.id && editingText?.field === 'content';

    const commonTextClasses = 'text-gray-900';
    const commonHoverClasses = 'hover:bg-gray-100';

    switch (slide.layout) {
      case 'title':
        return (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className='flex h-full flex-col items-center justify-center text-center'
          >
            <div className='group relative'>
              {isEditingTitle ? (
                <textarea
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => handleTextSave('title')}
                  onKeyDown={(e) => handleKeyPress(e, 'title')}
                  className={`mb-8 bg-transparent text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl ${commonTextClasses} w-full resize-none rounded-2xl border-2 border-gray-300 p-4 text-center outline-none`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  autoFocus
                  rows={2}
                />
              ) : (
                <motion.h1
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleTextClick('title')}
                  className={`mb-8 text-4xl font-black sm:text-5xl md:text-6xl lg:text-7xl ${commonTextClasses} cursor-pointer rounded-2xl p-4 leading-tight transition-all duration-300 ${commonHoverClasses}`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {slide.title}
                  {!isPlaying && (
                    <div className='absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      <div className='rounded-full bg-white/90 p-2 text-gray-700 shadow-lg'>
                        <Type size={16} />
                      </div>
                    </div>
                  )}
                </motion.h1>
              )}
            </div>
            <div className='group relative'>
              {isEditingContent ? (
                <textarea
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  onBlur={() => handleTextSave('content')}
                  onKeyDown={(e) => handleKeyPress(e, 'content')}
                  className={`text-lg sm:text-xl md:text-2xl lg:text-3xl ${commonTextClasses} w-full max-w-5xl resize-none rounded-2xl border-2 border-gray-300 bg-transparent p-4 text-center outline-none`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  autoFocus
                  rows={3}
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleTextClick('content')}
                  className={`mx-auto max-w-5xl cursor-pointer rounded-2xl p-4 text-lg leading-relaxed font-light opacity-90 transition-all duration-300 sm:text-xl md:text-2xl lg:text-3xl ${commonHoverClasses}`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {slide.content}
                  {!isPlaying && (
                    <div className='absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      <div className='rounded-full bg-white/90 p-2 text-gray-700 shadow-lg'>
                        <Type size={16} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className='flex h-full flex-col items-center justify-center text-center'
          >
            <div className='group relative mb-8'>
              {isEditingTitle ? (
                <textarea
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => handleTextSave('title')}
                  onKeyDown={(e) => handleKeyPress(e, 'title')}
                  className={`bg-transparent text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl ${commonTextClasses} w-full resize-none rounded-2xl border-2 border-gray-300 p-4 text-center outline-none`}
                  autoFocus
                  rows={2}
                />
              ) : (
                <motion.h2
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleTextClick('title')}
                  className={`text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl ${commonTextClasses} cursor-pointer rounded-2xl p-4 leading-tight transition-all duration-300 ${commonHoverClasses}`}
                >
                  {slide.title}
                  {!isPlaying && (
                    <div className='absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      <div className='rounded-full bg-white/90 p-2 text-gray-700 shadow-lg'>
                        <Type size={16} />
                      </div>
                    </div>
                  )}
                </motion.h2>
              )}
            </div>
            <div className='group relative'>
              {isEditingContent ? (
                <textarea
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  onBlur={() => handleTextSave('content')}
                  onKeyDown={(e) => handleKeyPress(e, 'content')}
                  className={`text-lg sm:text-xl md:text-2xl lg:text-3xl ${commonTextClasses} w-full max-w-5xl resize-none rounded-2xl border-2 border-gray-300 bg-transparent p-4 text-center outline-none`}
                  autoFocus
                  rows={4}
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleTextClick('content')}
                  className={`max-w-5xl cursor-pointer rounded-2xl p-4 text-lg leading-relaxed font-light opacity-90 transition-all duration-300 sm:text-xl md:text-2xl lg:text-3xl ${commonHoverClasses}`}
                >
                  {slide.content}
                  {!isPlaying && (
                    <div className='absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100'>
                      <div className='rounded-full bg-white/90 p-2 text-gray-700 shadow-lg'>
                        <Type size={16} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div
      className={`h-full w-full ${slide.backgroundColor} relative overflow-hidden text-gray-900`}
    >
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5'></div>
        <div className='absolute top-0 left-0 h-96 w-96 animate-pulse rounded-full bg-gray-100 opacity-50 mix-blend-overlay blur-3xl filter'></div>
        <div className='animation-delay-2000 absolute right-0 bottom-0 h-96 w-96 animate-pulse rounded-full bg-gray-200 opacity-50 mix-blend-overlay blur-3xl filter'></div>
        <div className='animation-delay-4000 absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-gray-100 opacity-50 mix-blend-overlay blur-3xl filter'></div>
      </div>
      {slide.backgroundImage && (
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url(${slide.backgroundImage})` }}
        >
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40'></div>
        </div>
      )}
      <div className='relative z-10 h-full p-8 sm:p-12 md:p-16 lg:p-20'>
        {renderContent()}
      </div>
      {!isPlaying && !editingText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm'
        >
          <MousePointer size={14} />
          Click text to edit
        </motion.div>
      )}
    </div>
  );
}
