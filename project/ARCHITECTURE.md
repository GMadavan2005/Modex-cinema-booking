# System Architecture

Detailed technical architecture of the Ticket Booking System.

## Overview

The system follows a client-server architecture with strict separation of concerns:

```
┌─────────────┐      HTTP/REST     ┌─────────────┐      SQL      ┌──────────────┐
│   React     │ ◄────────────────► │  Express.js │ ◄────────────►│  PostgreSQL  │
│   Frontend  │     JSON/API       │   Backend   │   Transactions│  (Supabase)  │
└─────────────┘                    └─────────────┘               └──────────────┘
```

## Technology Stack

### Frontend Layer
- **React 18**: Component-based UI library
- **TypeScript**: Type safety and better DX
- **React Router DOM**: Client-side routing
- **Context API**: Global state management
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server
- **Lucide React**: Icon library

### Backend Layer
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server code
- **pg**: PostgreSQL client library
- **CORS**: Cross-origin resource sharing

### Database Layer
- **PostgreSQL**: Relational database
- **Supabase**: Managed PostgreSQL hosting
- **Row Level Security (RLS)**: Fine-grained access control
- **Database Transactions**: ACID guarantees

## Data Flow

### User Booking Flow

```
1. User → Frontend: Select show and seats
                ↓
2. Frontend → API: POST /api/booking
                ↓
3. Backend: Validate request
                ↓
4. Backend → DB: BEGIN TRANSACTION
                ↓
5. Backend → DB: SELECT ... FOR UPDATE (lock show row)
                ↓
6. Backend: Check availability
                ↓
7. Backend → DB: INSERT booking (PENDING)
                ↓
8. Backend → DB: INSERT seat_allocations
                ↓
9. Backend → DB: UPDATE available_seats
                ↓
10. Backend → DB: UPDATE booking (CONFIRMED)
                ↓
11. Backend → DB: COMMIT TRANSACTION
                ↓
12. Backend → Frontend: Return booking confirmation
                ↓
13. Frontend: Show success page
```

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────────┐
│       shows          │
├──────────────────────┤
│ id (PK)             │◄─────┐
│ name                │      │
│ start_time          │      │
│ total_seats         │      │
│ available_seats     │      │
│ created_at          │      │
│ updated_at          │      │
└──────────────────────┘      │
                              │ 1
                              │
                              │ N
                    ┌─────────┴──────────┐
                    │     bookings       │
                    ├────────────────────┤
                    │ id (PK)            │◄─────┐
                    │ show_id (FK)       │      │
                    │ user_name          │      │
                    │ seats[]            │      │
                    │ status             │      │
                    │ created_at         │      │
                    │ updated_at         │      │
                    └────────────────────┘      │
                                                │ 1
                                                │
                                                │ N
                              ┌─────────────────┴─────────┐
                              │   seat_allocations        │
                              ├───────────────────────────┤
                              │ id (PK)                   │
                              │ show_id (FK)              │
                              │ seat_number               │
                              │ booking_id (FK)           │
                              │ created_at                │
                              │ UNIQUE(show_id, seat_num) │
                              └───────────────────────────┘
```

### Key Design Decisions

1. **Separate seat_allocations table**: Ensures each seat can only be allocated once via unique constraint
2. **available_seats counter**: Denormalized for fast availability checks
3. **seats array in bookings**: Convenient for displaying booked seats
4. **Status enum**: Track booking lifecycle (PENDING → CONFIRMED/FAILED)

## Concurrency Control

### Problem Statement

Multiple users attempting to book the same seats simultaneously could result in:
- Overbooking (more bookings than available seats)
- Double booking (same seat allocated to multiple users)
- Race conditions (inconsistent state)

### Solution: Database Transactions + Row Locking

```sql
BEGIN;

-- 1. Lock the show row (blocks other transactions)
SELECT * FROM shows WHERE id = $1 FOR UPDATE;

-- 2. Check availability
IF available_seats >= requested_seats THEN

  -- 3. Check specific seats not already taken
  SELECT seat_number FROM seat_allocations
  WHERE show_id = $1 AND seat_number = ANY($2);

  -- 4. Create booking
  INSERT INTO bookings (...) VALUES (...);

  -- 5. Allocate seats (unique constraint prevents duplicates)
  INSERT INTO seat_allocations (...) VALUES (...);

  -- 6. Update counter atomically
  UPDATE shows SET available_seats = available_seats - count;

  -- 7. Confirm booking
  UPDATE bookings SET status = 'CONFIRMED';

  COMMIT;
ELSE
  ROLLBACK;
END IF;
```

### Why This Works

1. **`FOR UPDATE`**: Locks the show row until transaction commits
2. **Atomic operations**: All-or-nothing execution
3. **Unique constraint**: Database-level prevention of duplicate seat allocation
4. **Serialization**: Transactions execute one at a time for the same show
5. **Rollback on error**: No partial state changes

### Performance Considerations

- Locking is row-level (only affects specific show)
- Other shows can be booked concurrently
- Lock is held only during transaction (milliseconds)
- Read queries don't require locks

## API Architecture

### RESTful Design

```
GET    /api/shows              - List all shows
GET    /api/shows/:id          - Get show details
POST   /api/admin/show         - Create show
POST   /api/booking            - Create booking
GET    /api/booking/:id        - Get booking
GET    /api/shows/:id/bookings - List bookings for show
GET    /api/shows/:id/allocated-seats - Get booked seats
```

### Layered Architecture

```
┌───────────────────────────────────────┐
│          Routes Layer                 │  - URL routing
│    (routes/showRoutes.ts)            │  - HTTP method mapping
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│       Controllers Layer               │  - Request/response handling
│   (controllers/showController.ts)    │  - Input validation
│                                       │  - Error handling
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│        Services Layer                 │  - Business logic
│   (services/bookingService.ts)       │  - Transaction management
│                                       │  - Data transformation
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│         Config Layer                  │  - Database connection
│     (config/database.ts)             │  - Connection pooling
└───────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── ShowProvider (Context)
│   └── BookingProvider (Context)
│       ├── Navigation
│       └── Routes
│           ├── HomePage
│           │   └── ShowList
│           ├── AdminPage
│           │   ├── CreateShow
│           │   └── ShowList
│           ├── BookingPage
│           │   └── BookingForm
│           │       └── SeatGrid
│           └── BookingConfirmationPage
```

### State Management

**Context API Pattern:**

```typescript
// Global state in contexts
ShowContext: {
  shows: Show[]
  loading: boolean
  error: string | null
  fetchShows()
  createShow()
}

BookingContext: {
  currentBooking: Booking | null
  loading: boolean
  error: string | null
  createBooking()
  getBookingById()
  clearBooking()
}
```

### Data Fetching Pattern

```typescript
// Service layer abstracts API calls
apiService.createBooking(data)
  ↓
fetch(API_URL + '/booking', { method: 'POST', body: JSON.stringify(data) })
  ↓
Response { success, data, error }
  ↓
Context updates state
  ↓
Components re-render
```

## Security Considerations

### Database Level
- Row Level Security (RLS) enabled
- Connection string in environment variables
- SSL connections in production
- Prepared statements (SQL injection prevention)

### Backend Level
- Input validation
- Error message sanitization
- CORS configuration
- Environment variable management

### Frontend Level
- No sensitive data in client code
- API URL in environment variables
- XSS prevention via React (auto-escaping)
- HTTPS in production

## Scalability

### Current Capacity
- Handles concurrent bookings via database locking
- Connection pooling for database efficiency
- Stateless backend (horizontal scaling possible)

### Scaling Strategies

**Database:**
- Read replicas for show listings
- Connection pooling (pg pool)
- Database indexing on foreign keys
- Partitioning for large datasets

**Backend:**
- Horizontal scaling (multiple instances)
- Load balancing
- Caching layer (Redis) for show data
- Message queue for async operations

**Frontend:**
- CDN for static assets
- Code splitting
- Lazy loading
- Service worker for offline capability

## Monitoring and Observability

### Logging
- Request/response logging
- Error logging with stack traces
- Database query logging
- Performance metrics

### Metrics to Track
- Booking success rate
- Average booking time
- Database connection pool utilization
- API response times
- Error rates by endpoint

### Alerts
- Database connection failures
- High error rates
- Transaction timeouts
- Slow query alerts

## Deployment Architecture

### Development
```
Local Machine
├── Frontend (Vite dev server) :5173
├── Backend (ts-node-dev) :3000
└── Database (Supabase)
```

### Production
```
Internet
    │
    ├─► Vercel CDN → React SPA
    │
    ├─► Render/Railway → Express API
    │
    └─► Supabase → PostgreSQL
```

## Future Enhancements

### Features
- Payment integration
- Email notifications
- PDF ticket generation
- Seat map visualization
- Real-time updates (WebSocket)
- Booking cancellation
- Waitlist functionality

### Technical Improvements
- Redis caching
- GraphQL API
- Background job processing
- Comprehensive test suite
- CI/CD pipeline
- Monitoring dashboard
- Rate limiting
- API versioning

## Performance Optimization

### Database
- Indexes on frequently queried columns
- Connection pooling
- Query optimization
- Read replicas for scaling reads

### Backend
- Response caching
- Compression middleware
- Request rate limiting
- Database query batching

### Frontend
- Code splitting
- Image optimization
- Bundle size optimization
- Prefetching critical data
- Service worker caching

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Component rendering
- API service methods

### Integration Tests
- API endpoint testing
- Database transaction testing
- Context provider testing
- Component interaction testing

### End-to-End Tests
- Complete booking flow
- Concurrency scenarios
- Error handling
- UI workflows

### Load Testing
- Concurrent booking simulation
- Database connection stress
- API response time under load
- Memory leak detection
