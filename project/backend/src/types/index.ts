export interface Show {
  id: string;
  name: string;
  start_time: Date;
  total_seats: number;
  available_seats: number;
  ticket_price?: number;
  poster_url?: string;
  trailer_url?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateShowRequest {
  name: string;
  start_time: Date;
  total_seats: number;
  ticket_price?: number;
  poster_url?: string;
  trailer_url?: string;
  description?: string;
}

export interface Booking {
  id: string;
  show_id: string;
  user_name: string;
  seats: number[];
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export interface CreateShowData {
  name: string;
  start_time: string;
  total_seats: number;
  ticket_price?: number;
  poster_url?: string;
  trailer_url?: string;
  description?: string;
}

export interface CreateBookingData {
  show_id: string;
  user_name: string;
  seats: number[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}