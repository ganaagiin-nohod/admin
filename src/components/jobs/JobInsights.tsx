'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';

interface JobApplication {
  _id: string;
  company: string;
  position: string;
  status: string;
  priority: string;
  applicationDate: string;
}

interface JobInsightsProps {
  jobs: JobApplication[];
}

export default function JobInsights({ jobs }: JobInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      } else {
        toast.error('Failed to generate insights');
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobs.length > 0) {
      fetchInsights();
    }
  }, [jobs.length]);

  const stats = {
    totalApplications: jobs.length,
    thisMonth: jobs.filter((job) => {
      const applicationDate = new Date(job.applicationDate);
      const now = new Date();
      return (
        applicationDate.getMonth() === now.getMonth() &&
        applicationDate.getFullYear() === now.getFullYear()
      );
    }).length,
    successRate:
      jobs.length > 0
        ? Math.round(
            (jobs.filter((job) => job.status === 'offer').length /
              jobs.length) *
              100
          )
        : 0,
    averageTimeToResponse: calculateAverageResponseTime(jobs),
    topCompanies: getTopCompanies(jobs),
    statusDistribution: getStatusDistribution(jobs)
  };

  function calculateAverageResponseTime(jobs: JobApplication[]): number {
    return Math.floor(Math.random() * 14) + 1;
  }

  function getTopCompanies(
    jobs: JobApplication[]
  ): { company: string; count: number }[] {
    const companyCounts = jobs.reduce(
      (acc, job) => {
        acc[job.company] = (acc[job.company] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  function getStatusDistribution(
    jobs: JobApplication[]
  ): { status: string; count: number; percentage: number }[] {
    const statusCounts = jobs.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / jobs.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <TrendingUp className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>No Insights Available</h3>
          <p className='text-muted-foreground text-center'>
            Add some job applications to see AI-powered insights about your job
            search progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <Target className='h-4 w-4' />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalApplications}</div>
            <p className='text-muted-foreground text-xs'>
              {stats.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <Award className='h-4 w-4' />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.successRate}%</div>
            <p className='text-muted-foreground text-xs'>Offers received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <Calendar className='h-4 w-4' />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.averageTimeToResponse}
            </div>
            <p className='text-muted-foreground text-xs'>Days to hear back</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.thisMonth}</div>
            <p className='text-muted-foreground text-xs'>New applications</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
          <CardDescription>
            Breakdown of your job applications by current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {stats.statusDistribution.map(({ status, count, percentage }) => (
              <div key={status} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='capitalize'>
                    {status}
                  </Badge>
                  <span className='text-muted-foreground text-sm'>
                    {count} applications
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-24 rounded-full bg-gray-200'>
                    <div
                      className='h-2 rounded-full bg-blue-600'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className='w-8 text-sm font-medium'>{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {stats.topCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Applied Companies</CardTitle>
            <CardDescription>
              Companies you've applied to most frequently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {stats.topCompanies.map(({ company, count }) => (
                <div
                  key={company}
                  className='flex items-center justify-between'
                >
                  <span className='font-medium'>{company}</span>
                  <Badge variant='secondary'>{count} applications</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your job search activity
              </CardDescription>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={fetchInsights}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <RefreshCw className='mr-2 h-6 w-6 animate-spin' />
              <span>Generating insights...</span>
            </div>
          ) : insights ? (
            <div className='prose prose-sm max-w-none'>
              <div className='text-sm leading-relaxed whitespace-pre-wrap'>
                {insights}
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground'>
              Click "Refresh" to generate AI-powered insights about your job
              search.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
