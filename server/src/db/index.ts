import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config();
const rootEnvPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}


const { Pool } = pkg;

// PostgreSQL connection pool with SSL handling for cloud databases (Neon, Supabase, RDS)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=disable')
    ? false
    : { rejectUnauthorized: false },
});

// Default seed admin credentials
export const DEFAULT_ADMIN = {
  id: 'default_tenant',
  email: 'yugshah82@gmail.com',
  password: 'Variance@2025',
  firstName: 'Default',
  lastName: 'User',
  organizationName: 'Default Org',
  crNumber: '',
  website: '',
  businessIndustry: '',
  companySize: '',
  phone: null,
};

let _isDbInitialized = false;

/**
 * Initializes the database tables and seeds the default admin user if not present.
 * This is safe to run multiple times (idempotent).
 */
export async function initDb(): Promise<void> {
  if (_isDbInitialized) return;
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL is not set; skipping database initialization.');
    return;
  }

  const client = await pool.connect();
  try {
    // 1. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schemaSql = '';

    if (fs.existsSync(schemaPath)) {
      schemaSql = fs.readFileSync(schemaPath, 'utf8');
    } else {
      // Fallback inline SQL if file not found in build directory
      schemaSql = `
        CREATE TABLE IF NOT EXISTS tenants (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) DEFAULT '',
          last_name VARCHAR(100) DEFAULT '',
          organization_name VARCHAR(255) DEFAULT 'QA Team',
          cr_number VARCHAR(100) DEFAULT '',
          website VARCHAR(255) DEFAULT '',
          business_industry VARCHAR(100) DEFAULT '',
          company_size VARCHAR(50) DEFAULT '',
          phone VARCHAR(50),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants (LOWER(email));

        CREATE TABLE IF NOT EXISTS wa_incoming_messages (
          id SERIAL PRIMARY KEY,
          message_id TEXT UNIQUE,
          "from" TEXT NOT NULL,
          from_name TEXT,
          body TEXT,
          timestamp BIGINT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
    }

    await client.query(schemaSql);

    // 2. Ensure default admin user exists
    const adminCheck = await client.query(
      'SELECT id FROM tenants WHERE LOWER(email) = LOWER($1)',
      [DEFAULT_ADMIN.email]
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      await client.query(
        `INSERT INTO tenants (
          id, email, password, first_name, last_name, organization_name,
          cr_number, website, business_industry, company_size, phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO NOTHING`,
        [
          DEFAULT_ADMIN.id,
          DEFAULT_ADMIN.email,
          hashedPassword,
          DEFAULT_ADMIN.firstName,
          DEFAULT_ADMIN.lastName,
          DEFAULT_ADMIN.organizationName,
          DEFAULT_ADMIN.crNumber,
          DEFAULT_ADMIN.website,
          DEFAULT_ADMIN.businessIndustry,
          DEFAULT_ADMIN.companySize,
          DEFAULT_ADMIN.phone,
        ]
      );
      console.log(`✅ Seeded default admin tenant: ${DEFAULT_ADMIN.email}`);
    }

    console.log('✅ Database initialized successfully: all tables and indices verified.');
    _isDbInitialized = true;
  } catch (err: any) {
    console.error('❌ Database initialization error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}
