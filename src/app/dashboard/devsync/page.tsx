'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Clock, Code } from 'lucide-react';
import Link from 'next/link';
import { CollaborationSession } from '@/types/devsync';

export default function DevSyncDashboard() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const createSession = async () => {
    if (!newSessionName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newSessionName,
          language: 'javascript'
        })
      });

      if (response.ok) {
        setNewSessionName('');
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>DevSync</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Real-time pair programming with AI assistance
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Code className='h-5 w-5' />
                Your Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {sessions.length === 0 ? (
                  <div className='py-8 text-center text-gray-500'>
                    No sessions yet. Create your first collaboration session!
                  </div>
                ) : (
                  sessions.map((session) => (
                    <Link
                      key={session._id || session.id}
                      href={`/dashboard/devsync/session/${session._id || session.id}`}
                      className='block'
                    >
                      <Card className='cursor-pointer transition-shadow hover:shadow-md'>
                        <CardContent className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h3 className='font-semibold'>{session.name}</h3>
                              <div className='mt-1 flex items-center gap-4 text-sm text-gray-500'>
                                <span className='flex items-center gap-1'>
                                  <Users className='h-4 w-4' />
                                  {session.participants.length} participants
                                </span>
                                <span className='flex items-center gap-1'>
                                  <Clock className='h-4 w-4' />
                                  {new Date(
                                    session.updatedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className='text-sm text-gray-500'>
                              {session.language}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                Create Session
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Input
                placeholder='Session name'
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createSession()}
              />
              <Button
                onClick={createSession}
                disabled={!newSessionName.trim() || isCreating}
                className='w-full'
              >
                {isCreating ? 'Creating...' : 'Create Session'}
              </Button>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex items-center gap-2'>
                <Code className='h-4 w-4 text-blue-500' />
                Real-time code collaboration
              </div>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4 text-green-500' />
                Video calls with peers
              </div>
              <div className='flex items-center gap-2'>
                <Plus className='h-4 w-4 text-purple-500' />
                AI-powered assistance
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-orange-500' />
                Session history & replay
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
