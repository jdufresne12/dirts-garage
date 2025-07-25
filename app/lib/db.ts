import { Pool } from 'pg';

const globalForPg = global as unknown as { pgPool: Pool };

export const pgPool =
    globalForPg.pgPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false, // For RDS SSL; remove if using local PG
        },
    });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pgPool;
