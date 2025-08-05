'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { JobApplication, JobStats } from '@/types/job';
import { useAutoSync } from '@/hooks/useAutoSync';
import GmailConnection from '@/components/jobs/GmailConnection';
import AutoSyncSettings from '@/components/jobs/AutoSyncSettings';
import JobInsights from '@/components/jobs/JobInsights';
import JobApplicationList from '@/components/jobs/JobApplicationList';
import JobApplicationForm from '@/components/jobs/JobApplicationForm';

export default function JobsPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailStatusLoading, setGmailStatusLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);

        const newStats = data.jobs.reduce(
          (acc: JobStats, job: JobApplication) => {
            acc.total++;
            acc[job.status as keyof JobStats]++;
            return acc;
          },
          {
            total: 0,
            applied: 0,
            screening: 0,
            interview: 0,
            offer: 0,
            rejected: 0
          }
        );
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch job applications');
    } finally {
      setLoading(false);
    }
  };

  // Auto-sync emails every 30 minutes when Gmail is connected
  useAutoSync({
    enabled: gmailConnected && !gmailStatusLoading,
    intervalMinutes: 30,
    onSync: fetchJobs
  });

  const checkGmailStatus = async () => {
    try {
      const response = await fetch('/api/gmail/status');
      if (response.ok) {
        const data = await response.json();
        setGmailConnected(data.connected);
      }
    } catch (error) {
      console.error('Error checking Gmail status:', error);
    } finally {
      setGmailStatusLoading(false);
    }
  };

  const syncEmails = async () => {
    if (!gmailConnected) {
      toast.error('Please connect Gmail first');
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/jobs/sync-emails', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Sync complete! Processed ${data.emailsProcessed} emails, updated ${data.jobsUpdated} jobs, created ${data.newJobsCreated} new jobs`
        );
        fetchJobs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to sync emails');
      }
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast.error('Failed to sync emails');
    } finally {
      setSyncing(false);
    }
  };

  const handleJobSubmit = async (jobData: any) => {
    try {
      const url = editingJob ? `/api/jobs/${editingJob._id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        toast.success(
          editingJob ? 'Job updated successfully' : 'Job added successfully'
        );
        setShowForm(false);
        setEditingJob(null);
        fetchJobs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleJobDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Job deleted successfully');
        fetchJobs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
      checkGmailStatus();
    }
  }, [user]);

  const filteredJobs =
    activeTab === 'all' ? jobs : jobs.filter((job) => job.status === activeTab);

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <RefreshCw className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Job Applications</h1>
          <p className='text-muted-foreground'>
            Track and manage your job applications with AI-powered insights
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={syncEmails}
            disabled={!gmailConnected || syncing}
            variant='outline'
          >
            {syncing ? (
              <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Mail className='mr-2 h-4 w-4' />
            )}
            Sync Emails
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add Job
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-6'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.applied}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Screening</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.screening}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.interview}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats.offer}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      <GmailConnection
        connected={gmailConnected}
        loading={gmailStatusLoading}
        onConnectionChange={setGmailConnected}
      />

      <AutoSyncSettings gmailConnected={gmailConnected} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='all'>All ({stats.total})</TabsTrigger>
          <TabsTrigger value='applied'>Applied ({stats.applied})</TabsTrigger>
          <TabsTrigger value='screening'>
            Screening ({stats.screening})
          </TabsTrigger>
          <TabsTrigger value='interview'>
            Interview ({stats.interview})
          </TabsTrigger>
          <TabsTrigger value='offer'>Offers ({stats.offer})</TabsTrigger>
          <TabsTrigger value='insights'>
            <TrendingUp className='mr-2 h-4 w-4' />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value='insights'>
          <JobInsights jobs={jobs} />
        </TabsContent>

        <TabsContent
          value={activeTab}
          className={activeTab === 'insights' ? 'hidden' : ''}
        >
          <JobApplicationList
            jobs={filteredJobs}
            onEdit={(job) => {
              setEditingJob(job);
              setShowForm(true);
            }}
            onDelete={handleJobDelete}
          />
        </TabsContent>
      </Tabs>

      {showForm && (
        <JobApplicationForm
          job={editingJob}
          onSubmit={handleJobSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}
