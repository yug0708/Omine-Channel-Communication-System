-- Database schema definition for Omine-Channel-Communication-System
-- Compatible with PostgreSQL (including Neon Serverless PostgreSQL)

-- 1. Tenants / Users table (Supports registration, login, and tenant management)
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

-- Case-insensitive index on email for quick login lookups
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants (LOWER(email));

-- 2. WhatsApp Incoming Messages table (Persists webhook messages across serverless calls)
CREATE TABLE IF NOT EXISTS wa_incoming_messages (
    id SERIAL PRIMARY KEY,
    message_id TEXT UNIQUE,
    "from" TEXT NOT NULL,
    from_name TEXT,
    body TEXT,
    timestamp BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_timestamp ON wa_incoming_messages (timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_from ON wa_incoming_messages ("from");
