export interface Show {
  id: string;
  name: string;
  start_time: string;
  total_seats: number;
  available_seats: number;
  trailer_url?: string;  // ADD THIS LINE
  created_at: string;
  updated_at: string;
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
