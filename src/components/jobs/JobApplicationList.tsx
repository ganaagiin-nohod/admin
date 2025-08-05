'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import {
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  MapPin,
  Mail,
  Search
} from 'lucide-react';
import { JobStatus, JobPriority } from '@/models/JobApplication';
import { JobApplication } from '@/types/job';

interface JobApplicationListProps {
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (jobId: string) => void;
}

export default function JobApplicationList({
  jobs,
  onEdit,
  onDelete
}: JobApplicationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredAndSortedJobs = jobs
    .filter(
      (job) =>
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === 'applicationDate' || sortBy === 'lastUpdated') {
        aValue = new Date(a[sortBy]).getTime();
        bValue = new Date(b[sortBy]).getTime();
      } else {
        const aRaw = a[sortBy as keyof JobApplication];
        const bRaw = b[sortBy as keyof JobApplication];

        aValue =
          typeof aRaw === 'string'
            ? aRaw.toLowerCase()
            : String(aRaw || '').toLowerCase();
        bValue =
          typeof bRaw === 'string'
            ? bRaw.toLowerCase()
            : String(bRaw || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.APPLIED:
        return 'bg-blue-100 text-blue-800';
      case JobStatus.SCREENING:
        return 'bg-yellow-100 text-yellow-800';
      case JobStatus.INTERVIEW:
        return 'bg-purple-100 text-purple-800';
      case JobStatus.OFFER:
        return 'bg-green-100 text-green-800';
      case JobStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case JobStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case JobPriority.HIGH:
        return 'bg-red-100 text-red-800';
      case JobPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case JobPriority.LOW:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (salary?: {
    min?: number;
    max?: number;
    currency?: string;
  }) => {
    if (!salary || (!salary.min && !salary.max)) return null;

    let currency = salary.currency || 'USD';
    const currencyMap: { [key: string]: string } = {
      '€': 'EUR',
      $: 'USD',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      'â¬': 'EUR'
    };

    if (currencyMap[currency]) {
      currency = currencyMap[currency];
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      currency = 'USD';
    }

    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });

      if (salary.min && salary.max) {
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
      } else if (salary.min) {
        return `${formatter.format(salary.min)}+`;
      } else if (salary.max) {
        return `Up to ${formatter.format(salary.max)}`;
      }
    } catch (error) {
      console.error('Error formatting salary:', error, { currency, salary });

      const originalCurrency = salary.currency || 'USD';
      if (salary.min && salary.max) {
        return `${originalCurrency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
      } else if (salary.min) {
        return `${originalCurrency} ${salary.min.toLocaleString()}+`;
      } else if (salary.max) {
        return `Up to ${originalCurrency} ${salary.max.toLocaleString()}`;
      }
    }

    return null;
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <div className='text-center'>
            <h3 className='mb-2 text-lg font-semibold'>
              No job applications yet
            </h3>
            <p className='text-muted-foreground mb-4'>
              Start tracking your job applications by adding your first one.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
          <Input
            placeholder='Search jobs by company, position, or location...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <div className='flex gap-2'>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='applicationDate'>Application Date</SelectItem>
              <SelectItem value='lastUpdated'>Last Updated</SelectItem>
              <SelectItem value='company'>Company</SelectItem>
              <SelectItem value='position'>Position</SelectItem>
              <SelectItem value='status'>Status</SelectItem>
              <SelectItem value='priority'>Priority</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='desc'>Newest</SelectItem>
              <SelectItem value='asc'>Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid gap-4'>
        {filteredAndSortedJobs.map((job) => (
          <Card key={job._id} className='transition-shadow hover:shadow-md'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>{job.position}</CardTitle>
                  <p className='text-muted-foreground font-medium'>
                    {job.company}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge className={getPriorityColor(job.priority)}>
                    {job.priority}
                  </Badge>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                <div className='text-muted-foreground flex flex-wrap gap-4 text-sm'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    Applied {new Date(job.applicationDate).toLocaleDateString()}
                  </div>
                  {job.location && (
                    <div className='flex items-center gap-1'>
                      <MapPin className='h-4 w-4' />
                      {job.location}
                    </div>
                  )}
                  {job.salary && (
                    <div className='flex items-center gap-1'>
                      <DollarSign className='h-4 w-4' />
                      {formatSalary(job.salary)}
                    </div>
                  )}
                  {job.contactEmail && (
                    <div className='flex items-center gap-1'>
                      <Mail className='h-4 w-4' />
                      {job.contactEmail}
                    </div>
                  )}
                </div>

                {job.notes && (
                  <div className='text-sm'>
                    <p className='text-muted-foreground line-clamp-2'>
                      {job.notes.length > 150
                        ? `${job.notes.substring(0, 150)}...`
                        : job.notes}
                    </p>
                  </div>
                )}

                <div className='flex items-center justify-between pt-2'>
                  <div className='text-muted-foreground text-xs'>
                    Last updated{' '}
                    {new Date(job.lastUpdated).toLocaleDateString()}
                  </div>
                  <div className='flex items-center gap-2'>
                    {job.jobUrl && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => window.open(job.jobUrl, '_blank')}
                      >
                        <ExternalLink className='h-4 w-4' />
                      </Button>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onEdit(job)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='outline' size='sm'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Job Application
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the application for{' '}
                            {job.position} at {job.company}? This action cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(job._id)}
                            className='bg-red-600 hover:bg-red-700'
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedJobs.length === 0 && searchTerm && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='text-center'>
              <h3 className='mb-2 text-lg font-semibold'>No jobs found</h3>
              <p className='text-muted-foreground'>
                No job applications match your search criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
