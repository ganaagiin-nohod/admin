'use client';

import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Camera, Video } from 'lucide-react';
import { ILogEntry } from '@/models/DailyLog';

interface LogEntryItemProps {
  entry: ILogEntry;
}

const entryIcons = {
  note: MessageSquare,
  image: Camera,
  video: Video
};

const entryColors = {
  note: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
  image:
    'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
  video:
    'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800'
};

export function LogEntryItem({ entry }: LogEntryItemProps) {
  const Icon = entryIcons[entry.type];
  const colorClass = entryColors[entry.type];

  return (
    <Card className={`${colorClass} border`}>
      <CardContent className='p-4'>
        <div className='mb-2 flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <Icon className='h-4 w-4' />
            <Badge variant='secondary' className='text-xs'>
              {entry.type}
            </Badge>
          </div>
          <span className='text-muted-foreground text-xs'>
            {format(new Date(entry.timestamp), 'h:mm a')}
          </span>
        </div>

        {entry.mediaUrl && (
          <div className='mb-3'>
            {entry.type === 'image' && (
              <img
                src={entry.mediaUrl}
                alt='Entry media'
                className='h-auto max-h-64 max-w-full rounded-lg object-cover'
              />
            )}
            {entry.type === 'video' && (
              <video
                src={entry.mediaUrl}
                controls
                className='h-auto max-h-64 max-w-full rounded-lg'
              />
            )}
          </div>
        )}

        <p className='text-sm leading-relaxed whitespace-pre-wrap'>
          {entry.content}
        </p>
      </CardContent>
    </Card>
  );
}
