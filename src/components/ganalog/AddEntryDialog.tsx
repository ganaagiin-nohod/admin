'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MessageSquare, Camera, Video, Upload } from 'lucide-react';
import { IDailyLog } from '@/models/DailyLog';

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logId: string;
  onEntryAdded: (log: IDailyLog) => void;
}

const entryTypes = [
  { value: 'note', label: 'Note', icon: MessageSquare },
  { value: 'image', label: 'Image', icon: Camera },
  { value: 'video', label: 'Video', icon: Video }
];

export function AddEntryDialog({
  open,
  onOpenChange,
  logId,
  onEntryAdded
}: AddEntryDialogProps) {
  const [type, setType] = useState<'note' | 'image' | 'video'>('note');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      let mediaUrl = '';

      // Upload file if present
      if (mediaFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', mediaFile);

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            mediaUrl = uploadData.url;
          } else {
            // Fallback to blob URL for development/testing
            console.warn('File upload failed, using blob URL as fallback');
            mediaUrl = URL.createObjectURL(mediaFile);
          }
        } catch (uploadError) {
          console.warn(
            'File upload error, using blob URL as fallback:',
            uploadError
          );
          mediaUrl = URL.createObjectURL(mediaFile);
        } finally {
          setIsUploading(false);
        }
      }

      const response = await fetch(`/api/ganalog/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_entry',
          data: {
            type,
            content: content.trim(),
            mediaUrl: mediaUrl || undefined
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        onEntryAdded(data.log);
        setContent('');
        setMediaFile(null);
        setType('note');
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const selectedTypeData = entryTypes.find((t) => t.value === type);
  const Icon = selectedTypeData?.icon || MessageSquare;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Icon className='h-5 w-5' />
            Add Entry
          </DialogTitle>
          <DialogDescription>
            Add a note, image, or video to your daily log
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Entry Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entryTypes.map((entryType) => {
                  const TypeIcon = entryType.icon;
                  return (
                    <SelectItem key={entryType.value} value={entryType.value}>
                      <div className='flex items-center gap-2'>
                        <TypeIcon className='h-4 w-4' />
                        {entryType.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {(type === 'image' || type === 'video') && (
            <div className='space-y-2'>
              <Label>Upload {type === 'image' ? 'Image' : 'Video'}</Label>
              <div className='flex items-center gap-2'>
                <Input
                  type='file'
                  accept={type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className='flex-1'
                />
                <Button variant='outline' size='sm'>
                  <Upload className='h-4 w-4' />
                </Button>
              </div>
              {mediaFile && (
                <p className='text-muted-foreground text-sm'>
                  Selected: {mediaFile.name}
                </p>
              )}
            </div>
          )}
          <div className='space-y-2'>
            <Label>{type === 'note' ? 'Note' : 'Caption'}</Label>
            <Textarea
              placeholder={
                type === 'note'
                  ? "What's on your mind?"
                  : 'Add a caption for your media...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className='min-h-[100px]'
            />
          </div>

          {mediaFile && type === 'image' && (
            <div className='space-y-2'>
              <Label>Preview</Label>
              <img
                src={URL.createObjectURL(mediaFile)}
                alt='Preview'
                className='h-auto max-h-48 max-w-full rounded-lg object-cover'
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || isUploading}
          >
            {isUploading
              ? 'Uploading...'
              : isSubmitting
                ? 'Adding...'
                : 'Add Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
