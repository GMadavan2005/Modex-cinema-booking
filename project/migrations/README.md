# Database Migrations

This directory contains SQL migration files for the Ticket Booking System database schema.

## Prerequisites

- PostgreSQL 12 or higher
- Access to your PostgreSQL database (local or remote)
- psql command-line tool, pgAdmin, DBeaver, or any PostgreSQL client

## Applying Migrations

### Option 1: Using psql (Command Line)

**For local PostgreSQL:**
```bash
psql -U postgres -d ticket_booking -f 01_initial_schema.sql
```

**For remote PostgreSQL (with connection string):**
```bash
psql "postgresql://username:password@host:port/database" -f 01_initial_schema.sql
```

### Option 2: Using pgAdmin

1. Open pgAdmin and connect to your database
2. Right-click on your database and select "Query Tool"
3. Open the file `01_initial_schema.sql`
4. Click "Execute" (F5)

### Option 3: Using DBeaver

1. Connect to your PostgreSQL database
2. Open SQL Editor (SQL Editor button or Ctrl/Cmd + ])
3. Open the file `01_initial_schema.sql`
4. Click "Execute SQL Script" (Ctrl/Cmd + Enter)

### Option 4: Using TablePlus

1. Connect to your database
2. Press Cmd/Ctrl + K to open SQL editor
3. Paste the contents of `01_initial_schema.sql`
4. Press Cmd/Ctrl + Enter to execute

## Migration Files

### 01_initial_schema.sql

Creates the initial database schema with three main tables:

**Tables Created:**
- `shows` - Stores show/event information
- `bookings` - Stores booking records
- `seat_allocations` - Tracks individual seat assignments

**Features:**
- UUID primary keys
- Foreign key relationships
- Unique constraint on seat allocations
- Check constraints for data integrity
- Automatic timestamp management with triggers
- Indexes for performance optimization

## Verifying Migration

After applying the migration, verify that all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
```
 table_name
-----------------
 bookings
 seat_allocations
 shows
```

Check the structure of a specific table:
```sql
\d shows
```

Or using standard SQL:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shows'
ORDER BY ordinal_position;
```

## Rolling Back

If you need to remove all tables and start fresh:

```sql
DROP TABLE IF EXISTS seat_allocations CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

Then re-apply the migration.

## Troubleshooting

**Error: database does not exist**
```bash
createdb ticket_booking
```

**Error: permission denied**
- Ensure your PostgreSQL user has CREATE privileges
- Or use a superuser account

**Error: relation already exists**
- Tables already exist. Either:
  - Drop existing tables first (see Rolling Back section)
  - Or skip this migration

**Connection refused**
- Verify PostgreSQL is running: `pg_isready`
- Check connection string parameters
- Ensure firewall allows connections

## Production Deployment

For production environments:

1. **Always backup your database first**
```bash
pg_dump -U username -d dbname > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Test migration in staging environment first**

3. **Apply migration during low-traffic period**

4. **Monitor application logs after migration**

## Future Migrations

When adding new migrations:

1. Name them sequentially: `02_migration_name.sql`, `03_migration_name.sql`, etc.
2. Include a detailed comment header explaining changes
3. Make migrations idempotent when possible (use `IF NOT EXISTS`, etc.)
4. Test thoroughly before production deployment
