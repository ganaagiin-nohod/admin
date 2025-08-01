'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Reservation } from '@/types';
import { format } from 'date-fns';

export function ReservationsTable() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchReservations = async () => {
    try {
      const url =
        statusFilter === 'all'
          ? '/api/reservations'
          : `/api/reservations?status=${statusFilter}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setReservations(result.data);
      } else {
        toast.error('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Reservation status updated');
        fetchReservations();
      } else {
        toast.error('Failed to update reservation');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Failed to update reservation');
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Reservation deleted');
        fetchReservations();
      } else {
        toast.error('Failed to delete reservation');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className='flex justify-center p-8'>Loading reservations...</div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Reservations</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Reservations</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='confirmed'>Confirmed</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            No reservations found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Party Size</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <div className='font-medium'>
                        {reservation.customerName}
                      </div>
                      {reservation.specialRequests && (
                        <div className='text-muted-foreground text-sm'>
                          {reservation.specialRequests}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      <div>{reservation.customerEmail}</div>
                      <div className='text-muted-foreground'>
                        {reservation.customerPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      <div>
                        {format(new Date(reservation.date), 'MMM dd, yyyy')}
                      </div>
                      <div className='text-muted-foreground'>
                        {reservation.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{reservation.partySize}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {reservation.source}
                      </Badge>
                      {reservation.metadata?.referenceNumber && (
                        <span className='text-muted-foreground text-xs'>
                          #{reservation.metadata.referenceNumber}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Select
                        value={reservation.status}
                        onValueChange={(status) =>
                          updateReservationStatus(reservation.id, status)
                        }
                      >
                        <SelectTrigger className='w-32'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='pending'>Pending</SelectItem>
                          <SelectItem value='confirmed'>Confirmed</SelectItem>
                          <SelectItem value='cancelled'>Cancelled</SelectItem>
                          <SelectItem value='completed'>Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => deleteReservation(reservation.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
