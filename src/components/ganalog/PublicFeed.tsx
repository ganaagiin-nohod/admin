'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, TrendingUp } from 'lucide-react';
import { DailyLogCard } from './DailyLogCard';
import { IDailyLog } from '@/models/DailyLog';

interface PublicFeedProps {
  currentUserId?: string;
}

export function PublicFeed({ currentUserId }: PublicFeedProps) {
  const [publicLogs, setPublicLogs] = useState<IDailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicLogs();
  }, []);

  const fetchPublicLogs = async () => {
    try {
      const response = await fetch('/api/ganalog?public=true&limit=20');
      if (response.ok) {
        const data = await response.json();
        setPublicLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching public logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogUpdated = (updatedLog: IDailyLog) => {
    setPublicLogs((prev) =>
      prev.map((log) =>
        log._id?.toString() === updatedLog._id?.toString() ? updatedLog : log
      )
    );
  };

  const filteredLogs = publicLogs.filter((log) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      log.challenges.some((c) => c.text.toLowerCase().includes(query)) ||
      log.entries.some((e) => e.content.toLowerCase().includes(query)) ||
      log.summary?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className='py-8 text-center'>
        <div className='border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2'></div>
        <p className='text-muted-foreground mt-2'>Loading public feed...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          <h2 className='text-xl font-semibold'>Public Feed</h2>
        </div>
        <div className='flex items-center gap-2'>
          <Search className='text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search logs...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-64'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>
                  Total Public Logs
                </p>
                <p className='text-2xl font-bold'>{publicLogs.length}</p>
              </div>
              <TrendingUp className='text-muted-foreground h-8 w-8' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>Active Today</p>
                <p className='text-2xl font-bold'>
                  {
                    publicLogs.filter((log) => {
                      const today = new Date();
                      const logDate = new Date(log.date);
                      return logDate.toDateString() === today.toDateString();
                    }).length
                  }
                </p>
              </div>
              <Users className='text-muted-foreground h-8 w-8' />
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className='py-8 text-center'>
            <Users className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <h3 className='mb-2 text-lg font-semibold'>
              {searchQuery ? 'No matching logs found' : 'No public logs yet'}
            </h3>
            <p className='text-muted-foreground'>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Be the first to share your daily challenges publicly!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          {filteredLogs.map((log) => (
            <DailyLogCard
              key={log._id?.toString()}
              log={log}
              onUpdate={handleLogUpdated}
              isOwner={false}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {filteredLogs.length >= 20 && (
        <div className='text-center'>
          <Button variant='outline' onClick={fetchPublicLogs}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
