import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Show, CreateShowData } from '../types';
import { apiService } from '../services/api';

interface ShowContextType {
  shows: Show[];
  loading: boolean;
  error: string | null;
  fetchShows: () => Promise<void>;
  createShow: (data: CreateShowData) => Promise<Show | null>;
  getShowById: (id: string) => Promise<Show | null>;
}

const ShowContext = createContext<ShowContextType | undefined>(undefined);

export function ShowProvider({ children }: { children: ReactNode }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllShows();
      if (response.success && response.data) {
        setShows(response.data);
      } else {
        setError(response.error || 'Failed to fetch shows');
      }
    } catch (err) {
      setError('Failed to fetch shows');
    } finally {
      setLoading(false);
    }
  };

  const createShow = async (data: CreateShowData): Promise<Show | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createShow(data);
      if (response.success && response.data) {
        await fetchShows();
        return response.data;
      } else {
        setError(response.error || 'Failed to create show');
        return null;
      }
    } catch (err) {
      setError('Failed to create show');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getShowById = async (id: string): Promise<Show | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getShowById(id);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch show');
        return null;
      }
    } catch (err) {
      setError('Failed to fetch show');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // load shows when provider mounts
  useEffect(() => {
    fetchShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ShowContext.Provider
      value={{
        shows,
        loading,
        error,
        fetchShows,
        createShow,
        getShowById,
      }}
    >
      {children}
    </ShowContext.Provider>
  );
}

export function useShows() {
  const context = useContext(ShowContext);
  if (!context) {
    throw new Error('useShows must be used within a ShowProvider');
  }
  return context;
}
