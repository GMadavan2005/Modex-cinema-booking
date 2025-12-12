# Deployment Guide

Complete guide for deploying the Ticket Booking System to production.

## Architecture Overview

- **Database**: PostgreSQL (any provider)
- **Backend**: Express.js on Render or Railway
- **Frontend**: React on Vercel

## Prerequisites

- PostgreSQL database (AWS RDS, Digital Ocean, Railway, ElephantSQL, or any provider)
- [Render](https://render.com) or [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account
- GitHub repository
- Node.js 18+ for local development

## Step 1: Database Setup

### 1.1 Choose and Create PostgreSQL Database

**Option A: Railway (Easiest, includes free tier)**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Click "New" > "Database" > "PostgreSQL"
4. Note the connection string

**Option B: AWS RDS**
1. Create PostgreSQL RDS instance
2. Configure security groups
3. Note connection details

**Option C: Digital Ocean Managed Database**
1. Create PostgreSQL cluster
2. Configure firewall rules
3. Get connection string

**Option D: ElephantSQL (Free tier available)**
1. Create account at [elephantsql.com](https://elephantsql.com)
2. Create new instance
3. Copy connection URL

### 1.2 Apply Database Migrations

Connect to your database and run the migration:

```bash
# Using psql
psql "your-connection-string-here" -f migrations/01_initial_schema.sql

# Or use a GUI tool like pgAdmin, DBeaver, or TablePlus
# and execute the SQL file contents
```

### 1.3 Verify Schema

Connect to your database and verify these tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Should show:
- `shows`
- `bookings`
- `seat_allocations`

## Step 2: Backend Deployment

### Option A: Deploy to Render

#### 2.1 Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: ticket-booking-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

#### 2.2 Add Environment Variables

In Render dashboard, add:
```
DATABASE_URL=your-postgresql-connection-string
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 2.3 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://ticket-booking-backend.onrender.com`

### Option B: Deploy to Railway

#### 2.1 Create New Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Click "Add variables"

#### 2.2 Configure Project

Add environment variables:
```
DATABASE_URL=your-postgresql-connection-string
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 2.3 Configure Build

Railway auto-detects Node.js. If needed, add to `railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd backend && npm start"
```

#### 2.4 Deploy

1. Railway will automatically deploy
2. Click "Generate Domain" to get your backend URL
3. Note the URL: `https://your-app.railway.app`

### Verify Backend

Test your backend:
```bash
curl https://your-backend-url.com/health
```

Should return:
```json
{
  "success": true,
  "message": "Ticket Booking API is running",
  "timestamp": "..."
}
```

## Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare for Deployment

Ensure `.env.example` exists in project root:
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### 3.2 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.com/api`

6. Click "Deploy"

### 3.3 Deploy via Vercel CLI

```bash
cd project-root
npm i -g vercel
vercel login
vercel
```

Follow prompts and add environment variables when asked.

For production:
```bash
vercel --prod
```

### 3.4 Configure Environment

After deployment, add/update environment variables:
1. Go to Project Settings > Environment Variables
2. Add `VITE_API_BASE_URL` with your backend URL
3. Redeploy if needed

## Step 4: Post-Deployment Configuration

### 4.1 Update CORS

Update backend CORS to allow your frontend domain.

In `backend/src/app.ts`, verify CORS is set to:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 4.2 Update Frontend URL in Backend

Update the `FRONTEND_URL` environment variable in your backend deployment to match your Vercel URL.

### 4.3 Test the Application

1. Visit your Vercel URL
2. Go to Admin page
3. Create a test show
4. Try booking seats
5. Verify booking confirmation

## Step 5: Domain Configuration (Optional)

### Custom Domain for Frontend

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Custom Domain for Backend

**Render:**
1. Go to your service settings
2. Click "Custom Domain"
3. Add domain and update DNS

**Railway:**
1. Click on your service
2. Go to "Settings" > "Networking"
3. Add custom domain
4. Update DNS records

## Monitoring and Logs

### Backend Logs

**Render:**
- Go to your service
- Click "Logs" tab
- View real-time logs

**Railway:**
- Click on your deployment
- View logs in the "Deployments" section

### Database Logs

Check your PostgreSQL provider's dashboard for database logs and monitoring.

### Frontend Logs

1. Vercel Dashboard > Your Project
2. Click "Functions" or "Deployment" logs
3. View build and runtime logs

## Environment Variables Summary

### Backend (Render/Railway)
```env
DATABASE_URL=your-postgresql-connection-string
NODE_ENV=production
PORT=4000  # Usually auto-set by platform
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

## Troubleshooting

### Backend Issues

**Error: Cannot connect to database**
- Verify DATABASE_URL is correct and includes all parameters
- Check PostgreSQL server is running
- Ensure firewall rules allow connections from your backend server
- Test connection locally: `psql "your-connection-string"`

**Error: CORS policy blocking requests**
- Update FRONTEND_URL in backend env
- Verify CORS configuration in app.ts
- Redeploy backend

### Frontend Issues

**API calls failing**
- Check VITE_API_BASE_URL is correct
- Verify backend is running (test /health endpoint)
- Check browser console for errors
- Verify CORS settings allow your frontend domain

**Build failing**
- Run `npm run build` locally to test
- Check TypeScript errors with `npm run typecheck`
- Verify all dependencies are in package.json

### Database Issues

**Tables not found**
- Verify migrations were applied: connect and run `\dt` in psql
- Check migration file was executed without errors
- Re-run migration if needed: `psql "connection-string" -f migrations/01_initial_schema.sql`

**Constraint violations**
- Ensure unique constraint exists: `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'seat_allocations';`
- Verify foreign key constraints are in place

## Security Checklist

Before going to production:

- [ ] Use strong database password
- [ ] Enable SSL for database connections (most providers enable by default)
- [ ] Set proper CORS origins (not '*')
- [ ] Add rate limiting to backend
- [ ] Implement proper authentication for admin endpoints
- [ ] Add request validation middleware
- [ ] Set up monitoring and alerts
- [ ] Enable logging
- [ ] Use environment variables for all secrets
- [ ] Restrict database access to known IP addresses
- [ ] Set up database backups

## Scaling Considerations

### Database
- Choose appropriate instance size for your traffic
- Add database connection pooling (already implemented with pg Pool)
- Create indexes for frequently queried fields
- Set up read replicas for scaling reads

### Backend
- Enable autoscaling in Render/Railway
- Use load balancer for multiple instances
- Implement Redis for session management
- Add caching layer

### Frontend
- Vercel auto-scales
- Enable Edge caching
- Optimize images and assets
- Implement code splitting

## Cost Estimates

**Free Tier (Good for testing):**
- Railway PostgreSQL: Free tier available
- ElephantSQL: Free (20MB database)
- Render: Free (750 hours/month, sleeps after inactivity)
- Vercel: Free (100GB bandwidth)

**Production Tier:**
- AWS RDS PostgreSQL: From $15/month
- Digital Ocean Managed Database: From $15/month
- Railway: From $5/month
- Render Standard: $7/month per service
- Vercel Pro: $20/month

## Maintenance

### Regular Tasks
- Monitor database size and connections
- Check application logs for errors
- Update dependencies monthly
- Backup database regularly (set up automatic backups with your provider)
- Test booking under load periodically

### Updates
- Test updates locally first
- Deploy to staging environment
- Test thoroughly
- Deploy to production
- Monitor for issues

## Support

For deployment issues:
- Render: [render.com/docs](https://render.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- PostgreSQL: [postgresql.org/docs](https://www.postgresql.org/docs/)
