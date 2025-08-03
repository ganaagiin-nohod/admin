'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Sparkles, Wand2 } from 'lucide-react';

interface AIContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (description: string, businessType: string, tone: string) => void;
  generating: boolean;
}

export default function AIContentDialog({
  open,
  onOpenChange,
  onGenerate,
  generating
}: AIContentDialogProps) {
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [tone, setTone] = useState('professional');

  const handleGenerate = () => {
    if (!description.trim()) {
      return;
    }
    onGenerate(description, businessType, tone);
  };

  const examples = [
    "I'm a freelance web developer who specializes in React and Node.js. I love creating modern, responsive websites.",
    "We're a local bakery that's been serving fresh bread and pastries for over 20 years in downtown Portland.",
    "I'm a fitness coach helping people achieve their health goals through personalized training programs.",
    'We sell handmade jewelry inspired by nature, using sustainable materials and ethical practices.'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
              <Sparkles className='h-4 w-4' />
            </div>
            Generate Website with AI
          </DialogTitle>
          <DialogDescription>
            Tell us about your business or personal brand, and our AI will
            create professional website content for you.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='description' className='text-sm font-medium'>
              Describe your business or personal brand *
            </Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Tell us about what you do, your services, your story...'
              rows={4}
              className='resize-none'
            />
            <p className='text-xs text-gray-500'>
              Be specific about your services, target audience, and what makes
              you unique.
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='businessType' className='text-sm font-medium'>
                Business Type (optional)
              </Label>
              <Input
                id='businessType'
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder='e.g., Restaurant, Agency, Portfolio'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tone' className='text-sm font-medium'>
                Tone & Style
              </Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='professional'>Professional</SelectItem>
                  <SelectItem value='casual'>Casual & Friendly</SelectItem>
                  <SelectItem value='creative'>Creative & Bold</SelectItem>
                  <SelectItem value='friendly'>Warm & Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='rounded-lg bg-gray-50 p-4'>
            <h4 className='mb-2 text-sm font-medium text-gray-700'>
              Example descriptions:
            </h4>
            <div className='space-y-2'>
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setDescription(example)}
                  className='block w-full rounded p-2 text-left text-xs text-gray-600 transition-colors hover:bg-white hover:text-gray-800'
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!description.trim() || generating}
              className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            >
              {generating ? (
                <>
                  <Wand2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Generate Website
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
