-- Check if columns exist, add if they don't
ALTER TABLE shows 
ADD COLUMN IF NOT EXISTS trailer_url TEXT,
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10, 2);

-- Add comments
COMMENT ON COLUMN shows.trailer_url IS 'Optional YouTube trailer URL';
COMMENT ON COLUMN shows.poster_url IS 'Optional poster image URL';
COMMENT ON COLUMN shows.description IS 'Optional show description';
COMMENT ON COLUMN shows.ticket_price IS 'Optional ticket price';