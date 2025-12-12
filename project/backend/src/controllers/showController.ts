import { Request, Response } from 'express';
import { ShowService } from '../services/showService';
import { ApiResponse, CreateShowRequest } from '../types';

const showService = new ShowService();

export class ShowController {
  async createShow(req: Request, res: Response): Promise<void> {
    try {
      const { 
        name, 
        start_time, 
        total_seats,
        ticket_price,      // NEW
        poster_url,        // NEW
        trailer_url,       // NEW
        description        // NEW
      } = req.body as CreateShowRequest;

      // Validate required fields
      if (!name || !start_time || !total_seats) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, start_time, total_seats',
        } as ApiResponse);
        return;
      }

      if (total_seats < 1) {
        res.status(400).json({
          success: false,
          error: 'total_seats must be greater than 0',
        } as ApiResponse);
        return;
      }

      // NEW: Validate ticket_price if provided
      if (ticket_price !== undefined && ticket_price < 0) {
        res.status(400).json({
          success: false,
          error: 'ticket_price must be greater than or equal to 0',
        } as ApiResponse);
        return;
      }

      // NEW: Validate URLs if provided
      if (poster_url && !this.isValidUrl(poster_url)) {
        res.status(400).json({
          success: false,
          error: 'Invalid poster_url format',
        } as ApiResponse);
        return;
      }

      if (trailer_url && !this.isValidUrl(trailer_url)) {
        res.status(400).json({
          success: false,
          error: 'Invalid trailer_url format',
        } as ApiResponse);
        return;
      }

      const show = await showService.createShow({ 
        name, 
        start_time, 
        total_seats,
        ticket_price,      // NEW
        poster_url,        // NEW
        trailer_url,       // NEW
        description        // NEW
      });

      res.status(201).json({
        success: true,
        data: show,
        message: 'Show created successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error creating show:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create show',
      } as ApiResponse);
    }
  }

  // NEW: Helper method to validate URLs
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async getAllShows(req: Request, res: Response): Promise<void> {
    try {
      const shows = await showService.getAllShows();

      res.status(200).json({
        success: true,
        data: shows,
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching shows:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch shows',
      } as ApiResponse);
    }
  }

  async getShowById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const show = await showService.getShowById(id);

      if (!show) {
        res.status(404).json({
          success: false,
          error: 'Show not found',
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: show,
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching show:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch show',
      } as ApiResponse);
    }
  }

  async getAllocatedSeats(req: Request, res: Response): Promise<void> {
    try {
      const { showId } = req.params;

      const allocatedSeats = await showService.getAllocatedSeats(showId);

      res.status(200).json({
        success: true,
        data: allocatedSeats,
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching allocated seats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch allocated seats',
      } as ApiResponse);
    }
  }

  async getBookingsForShow(req: Request, res: Response): Promise<void> {
    try {
      const { showId } = req.params;

      const bookings = await showService.getBookingsForShow(showId);

      res.status(200).json({
        success: true,
        data: bookings,
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings',
      } as ApiResponse);
    }
  }
}

export const deleteShow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Show ID is required',
      } as ApiResponse);
      return;
    }

    const showService = new ShowService();
    const deleted = await showService.deleteShow(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Show not found',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting show:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete show',
    } as ApiResponse);
  }
};