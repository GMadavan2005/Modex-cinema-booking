import { API_BASE_URL } from '../config/api';
import { ApiResponse, CreateShowData, CreateBookingData, Show, Booking } from '../types';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

export const apiService = {
  async getAllShows(): Promise<ApiResponse<Show[]>> {
    return fetchAPI<Show[]>('/shows');
  },

  async getShowById(id: string): Promise<ApiResponse<Show>> {
    return fetchAPI<Show>(`/shows/${id}`);
  },

  async createShow(data: CreateShowData): Promise<ApiResponse<Show>> {
    return fetchAPI<Show>('/admin/show', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createBooking(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    return fetchAPI<Booking>('/booking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return fetchAPI<Booking>(`/booking/${id}`);
  },

  async getAllocatedSeats(showId: string): Promise<ApiResponse<number[]>> {
    return fetchAPI<number[]>(`/shows/${showId}/allocated-seats`);
  },

  async getBookingsForShow(showId: string): Promise<ApiResponse<Booking[]>> {
    return fetchAPI<Booking[]>(`/shows/${showId}/bookings`);
  },
};
