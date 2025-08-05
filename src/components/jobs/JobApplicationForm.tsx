'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { JobStatus, JobPriority } from '@/models/JobApplication';

interface JobApplicationFormProps {
  job?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function JobApplicationForm({
  job,
  onSubmit,
  onCancel
}: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: JobStatus.APPLIED,
    priority: JobPriority.MEDIUM,
    jobUrl: '',
    description: '',
    location: '',
    contactEmail: '',
    notes: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company || '',
        position: job.position || '',
        status: job.status || JobStatus.APPLIED,
        priority: job.priority || JobPriority.MEDIUM,
        jobUrl: job.jobUrl || '',
        description: job.description || '',
        location: job.location || '',
        contactEmail: job.contactEmail || '',
        notes: job.notes || '',
        salary: {
          min: job.salary?.min?.toString() || '',
          max: job.salary?.max?.toString() || '',
          currency: job.salary?.currency || 'USD'
        }
      });
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const salaryData = {
        min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
        max: formData.salary.max ? parseInt(formData.salary.max) : undefined,
        currency: formData.salary.currency
      };

      const submitData: any = {
        company: formData.company,
        position: formData.position,
        status: formData.status,
        priority: formData.priority,
        jobUrl: formData.jobUrl,
        description: formData.description,
        location: formData.location,
        contactEmail: formData.contactEmail,
        notes: formData.notes
      };

      if (salaryData.min || salaryData.max) {
        submitData.salary = salaryData;
      }

      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('salary.')) {
      const salaryField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {job ? 'Edit Job Application' : 'Add New Job Application'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='company'>Company *</Label>
              <Input
                id='company'
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                required
                placeholder='e.g. Google'
              />
            </div>
            <div>
              <Label htmlFor='position'>Position *</Label>
              <Input
                id='position'
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                required
                placeholder='e.g. Software Engineer'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JobStatus.APPLIED}>Applied</SelectItem>
                  <SelectItem value={JobStatus.SCREENING}>Screening</SelectItem>
                  <SelectItem value={JobStatus.INTERVIEW}>Interview</SelectItem>
                  <SelectItem value={JobStatus.OFFER}>Offer</SelectItem>
                  <SelectItem value={JobStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={JobStatus.WITHDRAWN}>Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='priority'>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JobPriority.LOW}>Low</SelectItem>
                  <SelectItem value={JobPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={JobPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='location'>Location</Label>
              <Input
                id='location'
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder='e.g. San Francisco, CA'
              />
            </div>
            <div>
              <Label htmlFor='contactEmail'>Contact Email</Label>
              <Input
                id='contactEmail'
                type='email'
                value={formData.contactEmail}
                onChange={(e) =>
                  handleInputChange('contactEmail', e.target.value)
                }
                placeholder='recruiter@company.com'
              />
            </div>
          </div>

          <div>
            <Label>Salary Range</Label>
            <div className='grid grid-cols-3 gap-2'>
              <Input
                value={formData.salary.min}
                onChange={(e) =>
                  handleInputChange('salary.min', e.target.value)
                }
                placeholder='Min'
                type='number'
              />
              <Input
                value={formData.salary.max}
                onChange={(e) =>
                  handleInputChange('salary.max', e.target.value)
                }
                placeholder='Max'
                type='number'
              />
              <Select
                value={formData.salary.currency}
                onValueChange={(value) =>
                  handleInputChange('salary.currency', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USD'>USD</SelectItem>
                  <SelectItem value='EUR'>EUR</SelectItem>
                  <SelectItem value='GBP'>GBP</SelectItem>
                  <SelectItem value='CAD'>CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor='jobUrl'>Job URL</Label>
            <Input
              id='jobUrl'
              type='url'
              value={formData.jobUrl}
              onChange={(e) => handleInputChange('jobUrl', e.target.value)}
              placeholder='https://company.com/jobs/123'
            />
          </div>

          <div>
            <Label htmlFor='description'>Job Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='Brief description of the role...'
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor='notes'>Notes</Label>
            <Textarea
              id='notes'
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder='Any additional notes, interview feedback, etc...'
              rows={4}
            />
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : job ? 'Update Job' : 'Add Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
