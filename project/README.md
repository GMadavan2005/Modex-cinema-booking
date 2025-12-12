# Ticket Booking System

A production-ready ticket booking system with concurrency-safe seat reservation built with React, TypeScript, Express.js, and PostgreSQL.

## Features

- **Concurrency-Safe Booking**: Implements PostgreSQL transactions and row-level locking to prevent overbooking
- **Real-time Seat Selection**: Visual seat grid showing available, selected, and booked seats
- **Admin Dashboard**: Create and manage shows/events
- **User Booking Flow**: Browse shows, select seats, and receive instant confirmation
- **Status Tracking**: Track booking status (PENDING, CONFIRMED, FAILED)
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- TypeScript
- React Router DOM
- Context API for state management
- Tailwind CSS
- Lucide React (icons)
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- pg (node-postgres client)

### Database
- PostgreSQL 12+
- Database transactions with SELECT FOR UPDATE
- Unique constraints for data integrity
- Automatic timestamp triggers

## Project Structure

```
project/
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript interfaces
│   │   ├── middleware/      # Express middleware
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── migrations/              # SQL migration files
│   └── 01_initial_schema.sql
│
├── src/                     # React frontend
│   ├── components/
│   │   ├── admin/          # Admin components
│   │   ├── booking/        # Booking components
│   │   └── common/         # Shared components
│   ├── config/             # Frontend configuration
│   ├── contexts/           # React Context providers
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   ├── types/              # TypeScript types
│   └── App.tsx
│
└── README.md
```

## Database Schema

### Tables

#### `shows`
- `id` (uuid): Primary key
- `name` (text): Show/event name
- `start_time` (timestamptz): Show start time
- `total_seats` (integer): Total available seats
- `available_seats` (integer): Current available seats
- `created_at`, `updated_at` (timestamptz): Timestamps

#### `bookings`
- `id` (uuid): Primary key
- `show_id` (uuid): Foreign key to shows
- `user_name` (text): Customer name
- `seats` (integer[]): Array of booked seat numbers
- `status` (text): PENDING | CONFIRMED | FAILED
- `created_at`, `updated_at` (timestamptz): Timestamps

#### `seat_allocations`
- `id` (uuid): Primary key
- `show_id` (uuid): Foreign key to shows
- `seat_number` (integer): Specific seat number
- `booking_id` (uuid): Foreign key to bookings
- Unique constraint on (show_id, seat_number)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ installed and running
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Database Setup

**Option A: Local PostgreSQL**

1. Install PostgreSQL on your machine if not already installed
2. Create a new database:
```bash
createdb ticket_booking
```

3. Apply the migration:
```bash
psql -U postgres -d ticket_booking -f migrations/01_initial_schema.sql
```

**Option B: Hosted PostgreSQL (AWS RDS, Digital Ocean, etc.)**

1. Create a PostgreSQL instance on your preferred provider
2. Note down your connection string
3. Connect and run the migration:
```bash
psql "postgresql://username:password@host:port/dbname" -f migrations/01_initial_schema.sql
```

Or use a GUI tool like pgAdmin, DBeaver, or Postico to execute the SQL file

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/ticket_booking
FRONTEND_URL=http://localhost:5173
```

Replace the `DATABASE_URL` with your actual PostgreSQL connection string.

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:4000`

### 4. Frontend Setup

```bash
cd ..  # Return to project root
npm install
```

Create `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Testing the Application

1. Open `http://localhost:5173` in your browser
2. Navigate to Admin page
3. Create a new show with name, date/time, and total seats
4. Go back to Shows page
5. Click "Book Now" on a show
6. Select seats and enter your name
7. Submit booking
8. View confirmation with booking details

## API Documentation

### Endpoints

#### Shows

**Create Show**
```
POST /api/admin/show
Content-Type: application/json

{
  "name": "Broadway Musical",
  "start_time": "2024-12-31T19:00:00Z",
  "total_seats": 100
}
```

**Get All Shows**
```
GET /api/shows
```

**Get Show by ID**
```
GET /api/shows/:id
```

#### Bookings

**Create Booking**
```
POST /api/booking
Content-Type: application/json

{
  "show_id": "uuid",
  "user_name": "John Doe",
  "seats": [1, 2, 3]
}
```

**Get Booking by ID**
```
GET /api/booking/:id
```

**Get Allocated Seats for Show**
```
GET /api/shows/:showId/allocated-seats
```

### Response Format

Success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Concurrency Handling

The system prevents overbooking using:

1. **PostgreSQL Transactions**: All booking operations are wrapped in transactions
2. **Row-Level Locking**: `SELECT ... FOR UPDATE` locks the show row during booking
3. **Atomic Updates**: Seat availability is updated atomically
4. **Unique Constraints**: Database-level constraint prevents duplicate seat assignments
5. **Validation**: Multiple validation checks before finalizing booking

### Booking Algorithm

```typescript
BEGIN TRANSACTION
  1. Lock show row (SELECT FOR UPDATE)
  2. Check available seats
  3. Verify specific seats not already allocated
  4. Create booking record (status: PENDING)
  5. Insert seat allocations
  6. Decrement available_seats
  7. Update booking status to CONFIRMED
COMMIT TRANSACTION
```

If any step fails, the transaction rolls back and no changes are made.

## Deployment

### Backend Deployment (Render/Railway)

#### Render

1. Create new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment Variables: Add `DATABASE_URL`, `PORT`, `NODE_ENV=production`, `FRONTEND_URL`

#### Railway

1. Create new project on [Railway](https://railway.app)
2. Connect GitHub repository
3. Set root directory to `backend`
4. Add environment variables
5. Railway will auto-detect and deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Set environment variable:
   - `VITE_API_URL`: Your backend URL
4. Deploy: `vercel --prod`

Or use Vercel Dashboard:
1. Import project from GitHub
2. Set root directory to project root
3. Add environment variables
4. Deploy

### Environment Variables for Production

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (usually set by hosting platform)
- `NODE_ENV`: production
- `FRONTEND_URL`: Your frontend URL (for CORS)

**Frontend:**
- `VITE_API_BASE_URL`: Your backend API URL

## Testing Concurrency

To test the concurrency safety:

1. Open the booking page in multiple browser tabs
2. Select the same seats in different tabs
3. Try to book simultaneously
4. Only one booking should succeed
5. Others should receive an error message

You can also run a load test using tools like Apache Bench or Artillery.

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct in backend/.env
- Verify PostgreSQL server is running
- Ensure database exists and migrations are applied
- Check port 4000 is available

### Frontend can't connect to backend
- Check VITE_API_BASE_URL in .env
- Verify backend is running on port 4000
- Check CORS settings in backend
- Open browser console for detailed errors

### Bookings failing
- Verify database migrations were applied successfully
- Check PostgreSQL logs for errors
- Ensure unique constraint exists on seat_allocations table
- Test database connection from backend

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.
