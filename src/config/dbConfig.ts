// config/sequelize.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Ensure environment variables are defined
const dbName: string = process.env.DB_NAME || '';
const dbUser: string = process.env.DB_USER || '';
const dbPass: string = process.env.DB_PASS || '';
const dbHost: string = process.env.DB_HOST || 'localhost';
const dbPort: number = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;

// Initialize Sequelize
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
});

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected via Sequelize');
  } catch (err) {
    console.error('❌ DB connection error:', err);
  }
})();

export default sequelize;
