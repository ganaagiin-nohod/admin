'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Users,
  Presentation,
  BookOpen
} from 'lucide-react';

interface AIPresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (slides: any[]) => void;
  generating: boolean;
  onGeneratingChange?: (generating: boolean) => void;
}

export default function AIPresentationDialog({
  open,
  onOpenChange,
  onGenerate,
  generating,
  onGeneratingChange
}: AIPresentationDialogProps) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [tone, setTone] = useState('professional');
  const [presentationType, setPresentationType] = useState('informational');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('toast', {
          detail: {
            message: 'Please enter a presentation topic',
            type: 'warning'
          }
        });
        window.dispatchEvent(event);
      }
      return;
    }

    onGeneratingChange?.(true);

    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: {
          message: '🤖 Generating your presentation...',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    }

    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          audience: audience.trim(),
          slideCount,
          tone,
          presentationType
        })
      });

      const data = await response.json();

      if (data.success) {
        const convertedSlides = data.slides.map((slide: any) => ({
          id: slide.id,
          title: slide.title,
          content: slide.content,
          backgroundColor: slide.backgroundColor || 'bg-white',
          layout: slide.layout
        }));

        onGenerate(convertedSlides);
        setTopic('');
        setAudience('');
        setSlideCount(5);
        setTone('professional');
        setPresentationType('informational');

        if (typeof window !== 'undefined') {
          if (data.warning) {
            const event = new CustomEvent('toast', {
              detail: {
                message: `⚠️ Generated ${data.slides.length} slides with fallback content. Please edit as needed.`,
                type: 'warning'
              }
            });
            window.dispatchEvent(event);
          } else {
            const event = new CustomEvent('toast', {
              detail: {
                message: `🎉 Generated ${data.slides.length} slides successfully!`,
                type: 'success'
              }
            });
            window.dispatchEvent(event);
          }
        }
      } else {
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('toast', {
            detail: {
              message: 'Failed to generate presentation: ' + data.error,
              type: 'error'
            }
          });
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('toast', {
          detail: { message: 'Failed to generate presentation', type: 'error' }
        });
        window.dispatchEvent(event);
      }
    } finally {
      onGeneratingChange?.(false);
    }
  };

  if (!open) return null;

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4'>
      <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white'>
        <div className='flex items-center justify-between border-b p-6'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 p-2 text-white'>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className='text-xl font-semibold'>
                AI Presentation Generator
              </h2>
              <p className='text-sm text-gray-500'>
                Let AI create your presentation in seconds
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className='rounded-lg p-2 transition-colors hover:bg-gray-100'
            disabled={generating}
          >
            <X size={20} />
          </button>
        </div>

        <div className='space-y-6 p-6'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              <BookOpen className='mr-2 inline h-4 w-4' />
              Presentation Topic *
            </label>
            <input
              type='text'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g., Introduction to Machine Learning, Marketing Strategy 2024, Climate Change Solutions'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
              disabled={generating}
            />
            <p className='text-xs text-gray-500'>
              Be specific about what you want to present
            </p>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              <Users className='mr-2 inline h-4 w-4' />
              Target Audience
            </label>
            <input
              type='text'
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder='e.g., Business executives, Students, General public, Technical team'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
              disabled={generating}
            />
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              <Presentation className='mr-2 inline h-4 w-4' />
              Number of Slides
            </label>
            <select
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
              disabled={generating}
            >
              <option value={3}>3 slides (Quick overview)</option>
              <option value={5}>5 slides (Standard)</option>
              <option value={7}>7 slides (Detailed)</option>
              <option value={10}>10 slides (Comprehensive)</option>
              <option value={15}>15 slides (In-depth)</option>
            </select>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Presentation Tone
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {[
                {
                  value: 'professional',
                  label: 'Professional',
                  desc: 'Formal and business-like'
                },
                {
                  value: 'casual',
                  label: 'Casual',
                  desc: 'Relaxed and conversational'
                },
                {
                  value: 'creative',
                  label: 'Creative',
                  desc: 'Innovative and inspiring'
                },
                {
                  value: 'friendly',
                  label: 'Friendly',
                  desc: 'Warm and approachable'
                }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  disabled={generating}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    tone === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='text-sm font-medium'>{option.label}</div>
                  <div className='text-xs text-gray-500'>{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Presentation Type
            </label>
            <div className='grid grid-cols-1 gap-2'>
              {[
                {
                  value: 'informational',
                  label: 'Informational',
                  desc: 'Share knowledge and facts'
                },
                {
                  value: 'persuasive',
                  label: 'Persuasive',
                  desc: 'Convince and influence audience'
                },
                {
                  value: 'educational',
                  label: 'Educational',
                  desc: 'Teach concepts and skills'
                },
                {
                  value: 'pitch',
                  label: 'Business Pitch',
                  desc: 'Present ideas or proposals'
                }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPresentationType(option.value)}
                  disabled={generating}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    presentationType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='text-sm font-medium'>{option.label}</div>
                  <div className='text-xs text-gray-500'>{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {topic && (
            <div className='rounded-lg bg-gray-50 p-4'>
              <h4 className='mb-2 text-sm font-medium text-gray-700'>
                Preview:
              </h4>
              <p className='text-sm text-gray-600'>
                Creating a{' '}
                <span className='font-medium'>
                  {slideCount}-slide {tone} {presentationType}
                </span>{' '}
                presentation about "<span className='font-medium'>{topic}</span>
                "
                {audience && (
                  <span>
                    {' '}
                    for <span className='font-medium'>{audience}</span>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-3 border-t bg-gray-50 p-6'>
          <button
            onClick={() => onOpenChange(false)}
            disabled={generating}
            className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:opacity-50'
          >
            {generating ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Generate Presentation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
