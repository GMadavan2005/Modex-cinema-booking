import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking, CreateBookingData } from '../types';
import { apiService } from '../services/api';

interface BookingContextType {
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  createBooking: (data: CreateBookingData) => Promise<Booking | null>;
  getBookingById: (id: string) => Promise<void>;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (
    data: CreateBookingData
  ): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createBooking(data);
      if (response.success && response.data) {
        setCurrentBooking(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to create booking');
        return null;
      }
    } catch (err) {
      setError('Failed to create booking');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getBookingById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getBookingById(id);
      if (response.success && response.data) {
        setCurrentBooking(response.data);
      } else {
        setError(response.error || 'Failed to fetch booking');
      }
    } catch (err) {
      setError('Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const clearBooking = () => {
    setCurrentBooking(null);
    setError(null);
  };

  return (
    <BookingContext.Provider
      value={{
        currentBooking,
        loading,
        error,
        createBooking,
        getBookingById,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
