import { pool } from '../config/database';
import { Booking, CreateBookingRequest } from '../types';
import { PoolClient } from 'pg';

export class BookingService {
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const { show_id, user_name, seats } = bookingData;

    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');

      const showQuery = `
        SELECT * FROM shows
        WHERE id = $1
        FOR UPDATE
      `;
      const showResult = await client.query(showQuery, [show_id]);

      if (showResult.rows.length === 0) {
        throw new Error('Show not found');
      }

      const show = showResult.rows[0];

      if (show.available_seats < seats.length) {
        throw new Error(
          `Not enough seats available. Available: ${show.available_seats}, Requested: ${seats.length}`
        );
      }

      for (const seatNumber of seats) {
        if (seatNumber < 1 || seatNumber > show.total_seats) {
          throw new Error(
            `Invalid seat number: ${seatNumber}. Must be between 1 and ${show.total_seats}`
          );
        }
      }

      const allocatedSeatsQuery = `
        SELECT seat_number FROM seat_allocations
        WHERE show_id = $1 AND seat_number = ANY($2)
      `;
      const allocatedSeatsResult = await client.query(allocatedSeatsQuery, [
        show_id,
        seats,
      ]);

      if (allocatedSeatsResult.rows.length > 0) {
        const bookedSeats = allocatedSeatsResult.rows.map(
          (row) => row.seat_number
        );
        throw new Error(
          `Seats already booked: ${bookedSeats.join(', ')}`
        );
      }

      const createBookingQuery = `
        INSERT INTO bookings (show_id, user_name, seats, status)
        VALUES ($1, $2, $3, 'PENDING')
        RETURNING *
      `;
      const bookingResult = await client.query(createBookingQuery, [
        show_id,
        user_name,
        seats,
      ]);

      const booking = bookingResult.rows[0];

      for (const seatNumber of seats) {
        const allocateSeatQuery = `
          INSERT INTO seat_allocations (show_id, seat_number, booking_id)
          VALUES ($1, $2, $3)
        `;
        await client.query(allocateSeatQuery, [show_id, seatNumber, booking.id]);
      }

      const updateAvailabilityQuery = `
        UPDATE shows
        SET available_seats = available_seats - $1
        WHERE id = $2
      `;
      await client.query(updateAvailabilityQuery, [seats.length, show_id]);

      const confirmBookingQuery = `
        UPDATE bookings
        SET status = 'CONFIRMED'
        WHERE id = $1
        RETURNING *
      `;
      const confirmedBookingResult = await client.query(confirmBookingQuery, [
        booking.id,
      ]);

      await client.query('COMMIT');

      return confirmedBookingResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');

      if (bookingData.show_id) {
        try {
          const failedBookingQuery = `
            INSERT INTO bookings (show_id, user_name, seats, status)
            VALUES ($1, $2, $3, 'FAILED')
            RETURNING *
          `;
          await client.query(failedBookingQuery, [
            show_id,
            user_name,
            seats,
          ]);
        } catch (logError) {
          console.error('Error logging failed booking:', logError);
        }
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const query = `
      SELECT * FROM bookings WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}
