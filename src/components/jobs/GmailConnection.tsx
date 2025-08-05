'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Mail, CheckCircle, XCircle, Unlink } from 'lucide-react';
import { toast } from 'sonner';

interface GmailConnectionProps {
  connected: boolean;
  loading?: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export default function GmailConnection({
  connected,
  loading: statusLoading = false,
  onConnectionChange
}: GmailConnectionProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmail/auth');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        toast.error('Failed to initiate Gmail connection');
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      toast.error('Failed to connect Gmail');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmail/status', {
        method: 'DELETE'
      });

      if (response.ok) {
        onConnectionChange(false);
        toast.success('Gmail disconnected successfully');
      } else {
        toast.error('Failed to disconnect Gmail');
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast.error('Failed to disconnect Gmail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Mail className='h-5 w-5' />
            <div>
              <CardTitle className='text-lg'>Gmail Integration</CardTitle>
              <CardDescription>
                Connect your Gmail to automatically track job-related emails
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {statusLoading ? (
              <>
                <Badge
                  variant='secondary'
                  className='bg-gray-100 text-gray-800'
                >
                  <div className='mr-1 h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600' />
                  Checking...
                </Badge>
                <Button variant='outline' size='sm' disabled>
                  <Mail className='mr-2 h-4 w-4' />
                  Connect Gmail
                </Button>
              </>
            ) : connected ? (
              <>
                <Badge
                  variant='secondary'
                  className='bg-green-100 text-green-800'
                >
                  <CheckCircle className='mr-1 h-3 w-3' />
                  Connected
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='outline' size='sm' disabled={loading}>
                      <Unlink className='mr-2 h-4 w-4' />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Gmail</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to disconnect Gmail? You will no
                        longer receive automatic job application updates from
                        your emails.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDisconnect}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Badge variant='secondary' className='bg-red-100 text-red-800'>
                  <XCircle className='mr-1 h-3 w-3' />
                  Not Connected
                </Badge>
                <Button onClick={handleConnect} disabled={loading}>
                  <Mail className='mr-2 h-4 w-4' />
                  {loading ? 'Connecting...' : 'Connect Gmail'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {!statusLoading && !connected && (
        <CardContent>
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <h4 className='mb-2 font-medium text-blue-900'>
              Why connect Gmail?
            </h4>
            <ul className='space-y-1 text-sm text-blue-800'>
              <li>• Automatically detect job-related emails</li>
              <li>• Update application statuses based on email content</li>
              <li>• Track interview invitations and offers</li>
              <li>• Never miss important job communications</li>
            </ul>
            <p className='mt-3 text-xs text-blue-700'>
              We only read job-related emails and never access personal
              information.
            </p>
          </div>
        </CardContent>
      )}

      {!statusLoading && connected && (
        <CardContent>
          <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
            <h4 className='mb-2 font-medium text-green-900'>
              Gmail Connected Successfully!
            </h4>
            <p className='text-sm text-green-800'>
              Your job applications will be automatically updated based on your
              Gmail activity. Use the "Sync Emails" button to check for new
              job-related emails.
            </p>
          </div>
        </CardContent>
      )}

      {statusLoading && (
        <CardContent>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='flex items-center justify-center py-4'>
              <div className='mr-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600' />
              <span className='text-gray-600'>
                Checking Gmail connection status...
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
