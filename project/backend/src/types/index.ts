// -------------------- SHOW TYPES --------------------

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

export interface CreateShowData {
  name: string;
  start_time: string;
  total_seats: number;
  ticket_price?: number;
  poster_url?: string;
  trailer_url?: string;
  description?: string;
}

// -------------------- BOOKING TYPES --------------------

export interface Booking {
  id: string;
  show_id: string;
  user_name: string;
  seats: number[];
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  show_id: string;
  user_name: string;
  seats: number[];
}

// -------------------- FIXED FINAL TYPE --------------------
// This matches your controllers + services EXACTLY
export interface CreateBookingRequest {
  show_id: string;                    // FIXED: snake_case
  user_name: string;                  // FIXED: snake_case
  seats: number[];                    // FIXED: number[]
  foodItems?: { id: number; quantity: number }[];
}

// -------------------- API RESPONSE --------------------

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
