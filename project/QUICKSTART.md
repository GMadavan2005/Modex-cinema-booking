# Quick Start Guide

Get the Ticket Booking System up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+ installed and running
- Terminal/Command line access

## Step 1: Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb ticket_booking

# Apply migrations
psql -U postgres -d ticket_booking -f migrations/01_initial_schema.sql
```

**Option B: Use existing PostgreSQL**
- Have your connection string ready: `postgresql://user:pass@host:port/dbname`
- Apply migrations using psql or a GUI tool like pgAdmin/DBeaver

## Step 2: Set Up Backend

```bash
cd backend
npm install
```

Create `.env` file in `backend` directory:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_booking
FRONTEND_URL=http://localhost:5173
```

Replace `DATABASE_URL` with your actual PostgreSQL connection string.

Start backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:4000`

## Step 3: Set Up Frontend

Open a new terminal window:

```bash
cd ..  # Go back to project root
npm install
```

Create `.env` file in project root:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Start frontend:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Step 4: Test the Application

1. Open browser to `http://localhost:5173`
2. Click **Admin** in navigation
3. Create a test show:
   - Name: "Test Show"
   - Start Time: Select any future date/time
   - Total Seats: 20
4. Click **Create Show**
5. Navigate back to **Shows**
6. Click **Book Now** on your show
7. Enter your name
8. Click seats to select them
9. Click **Confirm Booking**
10. See your booking confirmation!

## API Testing with Postman

1. Import `POSTMAN_COLLECTION.json` into Postman
2. Update the `base_url` variable to `http://localhost:4000/api`
3. Run the requests in order:
   - Create Show
   - Get All Shows
   - Create Booking
   - Get Booking by ID

## Testing Concurrency

To verify the system prevents overbooking:

1. Open the booking page in 2+ browser tabs
2. Select the SAME seats in each tab
3. Try to book simultaneously
4. Only ONE booking will succeed
5. Others will see "Seats already booked" error

## Common Issues

**Backend won't start:**
- Check DATABASE_URL is correct in backend/.env
- Verify PostgreSQL server is running
- Ensure migrations are applied
- Check port 4000 is not in use

**Frontend can't connect:**
- Verify VITE_API_BASE_URL in .env
- Ensure backend is running on port 4000
- Check browser console for errors

**Database errors:**
- Ensure migrations were applied: `psql -d ticket_booking -f migrations/01_initial_schema.sql`
- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Test connection: `psql "your-connection-string"`

## Next Steps

- Read `README.md` for detailed documentation
- Read `DEPLOYMENT.md` for production deployment
- Import `POSTMAN_COLLECTION.json` for API testing
- Review code in `backend/src` and `src` directories

## Stopping the Application

Frontend: Press `Ctrl+C` in frontend terminal
Backend: Press `Ctrl+C` in backend terminal

## Production Deployment

For deploying to production, see `DEPLOYMENT.md` for step-by-step instructions.
