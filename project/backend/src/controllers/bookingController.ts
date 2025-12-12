import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { ApiResponse, CreateBookingRequest } from '../types';

const bookingService = new BookingService();

export class BookingController {
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { show_id, user_name, seats } = req.body as CreateBookingRequest;

      if (!show_id || !user_name || !seats || !Array.isArray(seats) || seats.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: show_id, user_name, seats (array)',
        } as ApiResponse);
        return;
      }

      const booking = await bookingService.createBooking({
        show_id,
        user_name,
        seats,
      });

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully',
      } as ApiResponse);
    } catch (error: any) {
      console.error('Error creating booking:', error);

      if (error.message.includes('already booked')) {
        res.status(409).json({
          success: false,
          error: error.message,
        } as ApiResponse);
        return;
      }

      if (error.message.includes('Not enough seats') || error.message.includes('Invalid seat')) {
        res.status(400).json({
          success: false,
          error: error.message,
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create booking',
      } as ApiResponse);
    }
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await bookingService.getBookingById(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: booking,
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking',
      } as ApiResponse);
    }
  }
}
