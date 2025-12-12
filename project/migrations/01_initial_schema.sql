-- =====================================================
-- Ticket Booking System - Database Schema
-- =====================================================
-- This migration creates the complete schema for the ticket booking system.
-- Compatible with standard PostgreSQL 12+
--
-- Tables:
--   1. shows - Event/show information
--   2. bookings - User booking records
--   3. seat_allocations - Individual seat assignments
--
-- Features:
--   - Concurrency-safe booking with SELECT FOR UPDATE
--   - Unique constraint on seat allocations
--   - Automatic timestamp management
--   - Proper foreign key relationships
-- =====================================================

-- Create shows table
CREATE TABLE IF NOT EXISTS shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_available_seats CHECK (available_seats <= total_seats)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    seats INTEGER[] NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seat_allocations table
CREATE TABLE IF NOT EXISTS seat_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL CHECK (seat_number > 0),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_seat_per_show UNIQUE (show_id, seat_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shows_start_time ON shows(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_show_id ON bookings(show_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_seat_allocations_show_id ON seat_allocations(show_id);
CREATE INDEX IF NOT EXISTS idx_seat_allocations_booking_id ON seat_allocations(booking_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_shows_updated_at ON shows;
CREATE TRIGGER update_shows_updated_at
    BEFORE UPDATE ON shows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Migration Complete
-- =====================================================
-- To apply this migration, run:
--   psql -U your_username -d your_database -f 01_initial_schema.sql
--
-- Or use your preferred PostgreSQL client (pgAdmin, DBeaver, etc.)
-- =====================================================
