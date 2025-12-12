import { pool } from '../config/database';
import { Show, CreateShowRequest } from '../types';

export class ShowService {
async createShow(data: CreateShowRequest): Promise<Show> {
  const query = `
    INSERT INTO shows (
      name, 
      start_time, 
      total_seats, 
      available_seats,
      ticket_price,
      poster_url,
      trailer_url,
      description
    )
    VALUES ($1, $2, $3, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    data.name,
    data.start_time,
    data.total_seats,
    data.ticket_price || null,
    data.poster_url || null,
    data.trailer_url || null,
    data.description || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}
  async deleteShow(id: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'DELETE FROM seat_allocations WHERE show_id = $1',
        [id]
      );

      await client.query(
        'DELETE FROM bookings WHERE show_id = $1',
        [id]
      );

      const result = await client.query(
        'DELETE FROM shows WHERE id = $1 RETURNING *',
        [id]
      );

      await client.query('COMMIT');

      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async getAllShows(): Promise<Show[]> {
    const query = `
      SELECT * FROM shows
      ORDER BY start_time ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  async getShowById(id: string): Promise<Show | null> {
    const query = `
      SELECT * FROM shows WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getAllocatedSeats(showId: string): Promise<number[]> {
    const query = `
      SELECT seat_number FROM seat_allocations
      WHERE show_id = $1
      ORDER BY seat_number ASC
    `;

    const result = await pool.query(query, [showId]);
    return result.rows.map((row) => row.seat_number);
  }

  async getBookingsForShow(showId: string) {
    const query = `
      SELECT * FROM bookings
      WHERE show_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [showId]);
    return result.rows;
  }
}
