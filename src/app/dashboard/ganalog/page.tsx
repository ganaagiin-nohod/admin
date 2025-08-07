'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, TrendingUp, Music } from 'lucide-react';
import { DailyLogCard } from '@/components/ganalog/DailyLogCard';
import { IDailyLog } from '@/models/DailyLog';
import { PublicFeed } from '@/components/ganalog/PublicFeed';
import { CreateLogDialog } from '@/components/ganalog/CreateLogDialog';
import { MusicDashboard } from '@/components/ganabeats/MusicDashboard';

export default function GanaLogPage() {
  const { user } = useUser();
  const [myLogs, setMyLogs] = useState<IDailyLog[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLogs();
  }, []);

  const fetchMyLogs = async () => {
    try {
      const response = await fetch('/api/ganalog');
      if (response.ok) {
        const data = await response.json();
        setMyLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogCreated = (newLog: IDailyLog) => {
    setMyLogs((prev) => [newLog, ...prev]);
    setShowCreateDialog(false);
  };

  const handleLogUpdated = (updatedLog: IDailyLog) => {
    setMyLogs((prev) =>
      prev.map((log) =>
        log._id?.toString() === updatedLog._id?.toString() ? updatedLog : log
      )
    );
  };

  const todayLog = myLogs.find((log) => {
    const today = new Date();
    const logDate = new Date(log.date);
    return logDate.toDateString() === today.toDateString();
  });

  return (
    <div className='container mx-auto h-[calc(100vh-100px)] space-y-6 overflow-y-scroll p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>GanaLog</h1>
          <p className='text-muted-foreground'>
            Daily challenges, progress tracking, and AI-powered reflections
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          disabled={!!todayLog}
          className='gap-2'
        >
          <Plus className='h-4 w-4' />
          {todayLog ? "Today's Log Created" : "Start Today's Log"}
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Days</CardTitle>
            <Calendar className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{myLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Challenges Completed
            </CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {myLogs.reduce(
                (total, log) =>
                  total + log.challenges.filter((c) => c.completed).length,
                0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Success Rate</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {myLogs.length > 0
                ? Math.round(
                    (myLogs.reduce(
                      (total, log) =>
                        total +
                        log.challenges.filter((c) => c.completed).length,
                      0
                    ) /
                      myLogs.reduce(
                        (total, log) => total + log.challenges.length,
                        0
                      )) *
                      100
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='my-logs' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='my-logs'>My Logs</TabsTrigger>
          <TabsTrigger value='public-feed'>Public Feed</TabsTrigger>
          <TabsTrigger value='music' className='gap-2'>
            <Music className='h-4 w-4' />
            Music
          </TabsTrigger>
        </TabsList>

        <TabsContent value='my-logs' className='space-y-4'>
          {loading ? (
            <div className='py-8 text-center'>Loading your logs...</div>
          ) : myLogs.length === 0 ? (
            <Card>
              <CardContent className='py-8 text-center'>
                <h3 className='mb-2 text-lg font-semibold'>No logs yet</h3>
                <p className='text-muted-foreground mb-4'>
                  Start your first daily log to begin tracking your challenges
                  and progress
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create Your First Log
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {myLogs.map((log) => (
                <DailyLogCard
                  key={log._id?.toString()}
                  log={log}
                  onUpdate={handleLogUpdated}
                  isOwner={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='public-feed'>
          <PublicFeed currentUserId={user?.id} />
        </TabsContent>

        <TabsContent value='music'>
          <MusicDashboard />
        </TabsContent>
      </Tabs>

      <CreateLogDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onLogCreated={handleLogCreated}
      />
    </div>
  );
}
