'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Clock, Zap } from 'lucide-react';

interface AutoSyncSettingsProps {
  gmailConnected: boolean;
}

export default function AutoSyncSettings({
  gmailConnected
}: AutoSyncSettingsProps) {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState('30');

  useEffect(() => {
    const enabled = localStorage.getItem('autoSyncEnabled') === 'true';
    const interval = localStorage.getItem('syncInterval') || '30';
    setAutoSyncEnabled(enabled);
    setSyncInterval(interval);
  }, []);

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem('autoSyncEnabled', enabled.toString());
  };

  const handleIntervalChange = (interval: string) => {
    setSyncInterval(interval);
    localStorage.setItem('syncInterval', interval);
  };

  if (!gmailConnected) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Zap className='h-5 w-5' />
          <CardTitle className='text-lg'>Auto-Sync Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label htmlFor='auto-sync'>Enable Auto-Sync</Label>
            <p className='text-muted-foreground text-sm'>
              Automatically check for new job emails while browsing
            </p>
          </div>
          <Switch
            id='auto-sync'
            checked={autoSyncEnabled}
            onCheckedChange={handleToggleAutoSync}
          />
        </div>

        {autoSyncEnabled && (
          <div className='space-y-2'>
            <Label htmlFor='sync-interval'>Sync Interval</Label>
            <Select value={syncInterval} onValueChange={handleIntervalChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='15'>Every 15 minutes</SelectItem>
                <SelectItem value='30'>Every 30 minutes</SelectItem>
                <SelectItem value='60'>Every hour</SelectItem>
                <SelectItem value='120'>Every 2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
          <div className='flex items-start gap-2'>
            <Clock className='mt-0.5 h-4 w-4 text-blue-600' />
            <div className='text-sm text-blue-800'>
              <p className='font-medium'>How Auto-Sync Works</p>
              <p className='mt-1'>
                Auto-sync runs in your browser while you have the jobs page
                open. It will automatically check for new job-related emails and
                update your applications.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
