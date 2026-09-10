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

-- 3. Accounts table (Multi-tenant scoped by tenant_id)
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    address TEXT DEFAULT '',
    cr_number VARCHAR(100) DEFAULT '',
    assigned_to VARCHAR(100) DEFAULT '',
    country VARCHAR(100) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    pincode VARCHAR(50) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON accounts (tenant_id);

-- 4. Contacts table (Multi-tenant scoped by tenant_id)
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    contact_number VARCHAR(50) DEFAULT '',
    address TEXT DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    national_id VARCHAR(100) DEFAULT '',
    country VARCHAR(100) DEFAULT '',
    account_name VARCHAR(255) DEFAULT '',
    assigned_to VARCHAR(100) DEFAULT '',
    lifecycle VARCHAR(50) DEFAULT 'NA',
    labels TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts (tenant_id);
