'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const reservationSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  partySize: z
    .number()
    .min(1, 'Party size must be at least 1')
    .max(20, 'Maximum party size is 20'),
  specialRequests: z.string().optional()
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  onSuccess?: () => void;
}

export function ReservationForm({ onSuccess }: ReservationFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema)
  });

  const onSubmit = async (data: ReservationFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Reservation created successfully!');
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to create reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [];
  for (let hour = 10; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Make a Reservation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='customerName'>Full Name</Label>
              <Input
                id='customerName'
                {...register('customerName')}
                placeholder='Enter your full name'
              />
              {errors.customerName && (
                <p className='text-sm text-red-500'>
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='customerEmail'>Email</Label>
              <Input
                id='customerEmail'
                type='email'
                {...register('customerEmail')}
                placeholder='Enter your email'
              />
              {errors.customerEmail && (
                <p className='text-sm text-red-500'>
                  {errors.customerEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='customerPhone'>Phone Number</Label>
              <Input
                id='customerPhone'
                {...register('customerPhone')}
                placeholder='Enter your phone number'
              />
              {errors.customerPhone && (
                <p className='text-sm text-red-500'>
                  {errors.customerPhone.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='partySize'>Party Size</Label>
              <Select
                onValueChange={(value) =>
                  setValue('partySize', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select party size' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} {size === 1 ? 'person' : 'people'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.partySize && (
                <p className='text-sm text-red-500'>
                  {errors.partySize.message}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='date'>Date</Label>
              <Input
                id='date'
                type='date'
                {...register('date')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && (
                <p className='text-sm text-red-500'>{errors.date.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='time'>Time</Label>
              <Select onValueChange={(value) => setValue('time', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select time' />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.time && (
                <p className='text-sm text-red-500'>{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='specialRequests'>Special Requests (Optional)</Label>
            <Textarea
              id='specialRequests'
              {...register('specialRequests')}
              placeholder='Any special requests or dietary requirements...'
              rows={3}
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Creating Reservation...' : 'Make Reservation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
