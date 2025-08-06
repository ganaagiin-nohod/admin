'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import CodeEditor from '@/components/devsync/CodeEditor';
import VideoCall from '@/components/devsync/VideoCall';
import AIAssistant from '@/components/devsync/AIAssistant';
import SessionChat from '@/components/devsync/SessionChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Save } from 'lucide-react';
import Link from 'next/link';
import { CollaborationSession } from '@/types/devsync';

export default function SessionPage() {
  const { user } = useUser();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [currentCode, setCurrentCode] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const data = await response.json();
      setSession(data);
      setCurrentCode(data.code || '');
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  const saveSession = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: currentCode
        })
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleCodeSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setSelectedCode(selection);
    }
  };

  if (!session || !user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900'></div>
          <p className='mt-4'>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col'>
      <div className='flex items-center justify-between border-b p-4'>
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/devsync'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Button>
          </Link>
          <h1 className='text-xl font-semibold'>{session.name}</h1>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <Users className='h-4 w-4' />
            {session.participants?.length} participants
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button onClick={saveSession} size='sm'>
            <Save className='mr-2 h-4 w-4' />
            Save
          </Button>
        </div>
      </div>

      <div className='flex flex-1'>
        <div className='flex flex-1 flex-col'>
          <div className='flex-1'>
            <CodeEditor
              sessionId={sessionId}
              userId={user.id}
              initialCode={session.code}
              language={session.language}
              onCodeChange={setCurrentCode}
            />
          </div>
        </div>

        <div className='flex w-96 flex-col border-l'>
          <Card className='m-4'>
            <CardHeader>
              <CardTitle className='text-lg'>Video Call</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoCall sessionId={sessionId} userId={user.id} />
            </CardContent>
          </Card>
          <div className='m-4'>
            <AIAssistant
              sessionId={sessionId}
              selectedCode={selectedCode}
              onResponse={(response) => {
                console.log('AI Response:', response);
              }}
            />
          </div>

          <div className='m-4 flex-1'>
            <SessionChat
              sessionId={sessionId}
              userId={user.id}
              userName={
                user.fullName || user.emailAddresses[0]?.emailAddress || 'User'
              }
              initialMessages={
                session.chatHistory?.map(
                  (msg: {
                    timestamp: string | number | Date;
                    userId: any;
                    userName: any;
                    message: any;
                    type: string;
                  }) => ({
                    id: msg.timestamp.toString(),
                    sessionId,
                    userId: msg.userId,
                    userName: msg.userName,
                    message: msg.message,
                    timestamp: new Date(msg.timestamp),
                    type: msg.type as 'user' | 'ai'
                  })
                ) || []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
