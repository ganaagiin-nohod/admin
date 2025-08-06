'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Plus } from 'lucide-react';
import { IDailyLog } from '@/models/DailyLog';

interface CreateLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogCreated: (log: IDailyLog) => void;
}

export function CreateLogDialog({
  open,
  onOpenChange,
  onLogCreated
}: CreateLogDialogProps) {
  const [challenges, setChallenges] = useState<string[]>(['', '', '']);
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSuggestions();
    }
  }, [open]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ganalog/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleChallengeChange = (index: number, value: string) => {
    const newChallenges = [...challenges];
    newChallenges[index] = value;
    setChallenges(newChallenges);
  };

  const addChallenge = () => {
    if (challenges.length < 5) {
      setChallenges([...challenges, '']);
    }
  };

  const removeChallenge = (index: number) => {
    if (challenges.length > 1) {
      setChallenges(challenges.filter((_, i) => i !== index));
    }
  };

  const useSuggestion = (suggestion: string) => {
    const emptyIndex = challenges.findIndex((c) => c === '');
    if (emptyIndex !== -1) {
      handleChallengeChange(emptyIndex, suggestion);
    } else if (challenges.length < 5) {
      setChallenges([...challenges, suggestion]);
    }
  };

  const handleCreate = async () => {
    const validChallenges = challenges.filter((c) => c.trim() !== '');
    if (validChallenges.length === 0) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/ganalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          challenges: validChallenges,
          isPublic
        })
      });

      if (response.ok) {
        const data = await response.json();
        onLogCreated(data.log);
        setChallenges(['', '', '']);
        setIsPublic(true);
      }
    } catch (error) {
      console.error('Error creating log:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const validChallenges = challenges.filter((c) => c.trim() !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Start Today's Log</DialogTitle>
          <DialogDescription>
            Set your daily challenges and begin tracking your progress
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='space-y-4'>
            <Label className='text-base font-semibold'>
              Today's Challenges
            </Label>

            {challenges.map((challenge, index) => (
              <div key={index} className='flex gap-2'>
                <Input
                  placeholder={`Challenge ${index + 1}`}
                  value={challenge}
                  onChange={(e) => handleChallengeChange(index, e.target.value)}
                  className='flex-1'
                />
                {challenges.length > 1 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeChallenge(index)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            ))}

            {challenges.length < 5 && (
              <Button
                variant='outline'
                onClick={addChallenge}
                className='w-full gap-2'
              >
                <Plus className='h-4 w-4' />
                Add Another Challenge
              </Button>
            )}
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-blue-600' />
              <Label className='text-sm font-medium'>AI Suggestions</Label>
            </div>

            {loadingSuggestions ? (
              <div className='text-muted-foreground text-sm'>
                Loading suggestions...
              </div>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors'
                    onClick={() => useSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label className='text-base'>Make Public</Label>
              <div className='text-muted-foreground text-sm'>
                Allow others to see and interact with your log
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={validChallenges.length === 0 || isCreating}
          >
            {isCreating ? 'Creating...' : "Start Today's Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
