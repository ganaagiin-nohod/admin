'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Camera,
  Video,
  MessageSquare,
  Heart,
  Flame,
  Zap,
  Handshake,
  Send,
  Sparkles
} from 'lucide-react';
import { IDailyLog } from '@/models/DailyLog';
import { LogEntryItem } from './LogEntryItem';
import { AddEntryDialog } from './AddEntryDialog';
import { PlaylistEmbed } from '@/components/ganabeats/PlaylistEmbed';

interface DailyLogCardProps {
  log: IDailyLog;
  onUpdate: (updatedLog: IDailyLog) => void;
  isOwner: boolean;
  currentUserId?: string;
}

const reactionIcons = {
  fire: Flame,
  love: Heart,
  clap: Handshake,
  mind_blown: Zap
};

export function DailyLogCard({
  log,
  onUpdate,
  isOwner,
  currentUserId
}: DailyLogCardProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const completedChallenges = log.challenges.filter((c) => c.completed).length;
  const totalChallenges = log.challenges.length;

  const handleToggleChallenge = async (challengeId: string) => {
    if (!isOwner) return;

    try {
      const response = await fetch(`/api/ganalog/${log._id?.toString()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_challenge',
          data: { challengeId }
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.log);
      }
    } catch (error) {
      console.error('Error toggling challenge:', error);
    }
  };

  const handleGenerateSummary = async () => {
    if (!isOwner) return;

    try {
      const response = await fetch(`/api/ganalog/${log._id?.toString()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_summary'
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.log);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleReaction = async (type: string) => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`/api/ganalog/${log._id?.toString()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_reaction',
          data: { type }
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.log);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleAddComment = async () => {
    if (!currentUserId || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/ganalog/${log._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          data: {
            content: newComment.trim(),
            username: 'User' // You might want to get this from Clerk
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.log);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEntryAdded = (updatedLog: IDailyLog) => {
    onUpdate(updatedLog);
    setShowAddEntry(false);
  };

  const userReaction = log.reactions.find((r) => r.userId === currentUserId);

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>
            {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <Badge
            variant={
              completedChallenges === totalChallenges ? 'default' : 'secondary'
            }
          >
            {completedChallenges}/{totalChallenges} completed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='space-y-3'>
          <h3 className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>
            Today's Challenges
          </h3>
          {log.challenges.map((challenge) => (
            <div key={challenge.id} className='flex items-center space-x-3'>
              <Checkbox
                checked={challenge.completed}
                onCheckedChange={() => handleToggleChallenge(challenge.id)}
                disabled={!isOwner}
              />
              <span
                className={
                  challenge.completed
                    ? 'text-muted-foreground line-through'
                    : ''
                }
              >
                {challenge.text}
              </span>
            </div>
          ))}
        </div>

        {log.playlist && (
          <div className='space-y-2'>
            <h3 className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>
              Today's Vibe
            </h3>
            <PlaylistEmbed playlist={log.playlist} compact={false} />
          </div>
        )}

        {log.entries.length > 0 && (
          <div className='space-y-3'>
            <h3 className='text-muted-foreground text-sm font-semibold tracking-wide uppercase'>
              Daily Entries
            </h3>
            <div className='space-y-3'>
              {log.entries.map((entry) => (
                <LogEntryItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {isOwner && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAddEntry(true)}
              className='gap-2'
            >
              <MessageSquare className='h-4 w-4' />
              Add Note
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAddEntry(true)}
              className='gap-2'
            >
              <Camera className='h-4 w-4' />
              Add Photo
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAddEntry(true)}
              className='gap-2'
            >
              <Video className='h-4 w-4' />
              Add Video
            </Button>
          </div>
        )}

        {log.summary ? (
          <div className='rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-950/20 dark:to-purple-950/20'>
            <div className='mb-2 flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-semibold'>AI Reflection</span>
            </div>
            <p className='text-sm leading-relaxed'>{log.summary}</p>
          </div>
        ) : (
          isOwner &&
          log.entries.length > 0 && (
            <Button
              onClick={handleGenerateSummary}
              variant='outline'
              className='w-full gap-2'
            >
              <Sparkles className='h-4 w-4' />
              Summarize My Day
            </Button>
          )
        )}

        <Separator />

        <div className='flex items-center justify-between'>
          <div className='flex gap-2'>
            {Object.entries(reactionIcons).map(([type, Icon]) => {
              const count = log.reactions.filter((r) => r.type === type).length;
              const isActive = userReaction?.type === type;

              return (
                <Button
                  key={type}
                  variant={isActive ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => handleReaction(type)}
                  disabled={!currentUserId}
                  className='gap-1'
                >
                  <Icon className='h-4 w-4' />
                  {count > 0 && <span className='text-xs'>{count}</span>}
                </Button>
              );
            })}
          </div>

          <div className='text-muted-foreground text-sm'>
            {log.entries.length} entries
          </div>
        </div>

        {log.comments.length > 0 && (
          <div className='space-y-3'>
            <h4 className='text-sm font-semibold'>Comments</h4>
            {log.comments.map((comment) => (
              <div key={comment.id} className='bg-muted/50 rounded-lg p-3'>
                <div className='mb-1 flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    {comment.username}
                  </span>
                  <span className='text-muted-foreground text-xs'>
                    {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className='text-sm'>{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {currentUserId && (
          <div className='flex gap-2'>
            <Textarea
              placeholder='Add a comment...'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className='min-h-[60px]'
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmittingComment}
              size='sm'
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        )}
      </CardContent>

      <AddEntryDialog
        open={showAddEntry}
        onOpenChange={setShowAddEntry}
        logId={log._id?.toString() || ''}
        onEntryAdded={handleEntryAdded}
      />
    </Card>
  );
}
