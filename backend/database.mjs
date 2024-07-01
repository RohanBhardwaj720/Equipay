// Path: database.mjs

import pg from 'pg'
import env from 'dotenv'

env.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
})

async function runMigration() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Create users table
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.users (
          user_id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) UNIQUE NOT NULL,
          user_picture TEXT,
          user_name VARCHAR(100),
          user_upi_id VARCHAR(255)
        );
      `)

    // Create trips table
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.trips (
          trip_id SERIAL PRIMARY KEY,
          place VARCHAR(255) NOT NULL,
          total_spendings DOUBLE PRECISION,
          trip_organizer INTEGER REFERENCES public.users(user_id),
          start_datetime TIMESTAMP WITHOUT TIME ZONE
        );
      `)

    // Create trip_members table
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.trip_members (
          trip_id INTEGER REFERENCES public.trips(trip_id),
          user_id INTEGER REFERENCES public.users(user_id),
          user_spending DOUBLE PRECISION,
          PRIMARY KEY (user_id, trip_id)
        );
      `)

    // Create transaction_history table
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.transaction_history (
          transaction_id SERIAL PRIMARY KEY,
          amount DOUBLE PRECISION NOT NULL,
          paid_by INTEGER REFERENCES public.users(user_id),
          paid_to VARCHAR(255),
          transaction_datetime TIMESTAMP WITHOUT TIME ZONE,
          trip_id INTEGER REFERENCES public.trips(trip_id)
        );
      `)

    await client.query('COMMIT')
    console.log('Migration completed successfully')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration failed', err)
    throw err
  } finally {
    client.release()
  }
}

export { pool }
export { runMigration }
