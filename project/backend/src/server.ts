import dotenv from 'dotenv';
import app from './app';
import { testConnection } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
