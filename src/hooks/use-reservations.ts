'use client';

import { useState, useEffect } from 'react';
import { Reservation, CreateReservationData } from '@/types';
import { toast } from 'sonner';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async (status?: string) => {
    try {
      setIsLoading(true);
      const url = status
        ? `/api/reservations?status=${status}`
        : '/api/reservations';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setReservations(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch reservations');
        toast.error('Failed to fetch reservations');
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch reservations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createReservation = async (data: CreateReservationData) => {
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
        await fetchReservations();
        return result.data;
      } else {
        toast.error(result.error || 'Failed to create reservation');
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error('Failed to create reservation');
      throw err;
    }
  };

  const updateReservation = async (
    id: string,
    updates: Partial<Reservation>
  ) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Reservation updated successfully!');
        await fetchReservations();
        return result.data;
      } else {
        toast.error(result.error || 'Failed to update reservation');
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error('Failed to update reservation');
      throw err;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Reservation deleted successfully!');
        await fetchReservations();
        return true;
      } else {
        toast.error(result.error || 'Failed to delete reservation');
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error('Failed to delete reservation');
      throw err;
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    isLoading,
    error,
    fetchReservations,
    createReservation,
    updateReservation,
    deleteReservation
  };
}
