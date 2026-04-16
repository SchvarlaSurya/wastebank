import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment variables. Please check your .env or .env.local file.");
}

// export default sql connection singleton for Server Actions and API routes
export const sql = neon(process.env.DATABASE_URL);
