import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { pool, initDb, getDbConnectionInfo } from './db/index.js';

dotenv.config({ quiet: true });

// Ensure all database tables exist and admin user is seeded
initDb().catch(err => console.error('Database initialization notice:', err.message));


// Lazy-load whatsappService to avoid Puppeteer crash on Vercel serverless startup
type WhatsAppServiceModule = typeof import('./whatsappService.js');
let _whatsappService: WhatsAppServiceModule | null = null;
async function getWAService(): Promise<WhatsAppServiceModule> {
  if (!_whatsappService) {
    _whatsappService = await import('./whatsappService.js');
  }
  return _whatsappService;
}

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

interface Tenant {
  id: string;
  organizationName: string;
  crNumber: string;
  website: string;
  businessIndustry: string;
  companySize: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', message: 'Backend server is running!' });
});

// Debug endpoint — diagnose environment and DB
app.get('/api/debug', async (_req: Request, res: Response): Promise<void> => {
  const info: Record<string, any> = {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ SET' : '❌ MISSING',
      WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN ? '✅ SET' : '❌ MISSING',
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ MISSING',
      WHATSAPP_WABA_ID: process.env.WHATSAPP_WABA_ID || '❌ MISSING',
      WHATSAPP_APP_ID: process.env.WHATSAPP_APP_ID || '❌ MISSING',
      WHATSAPP_REDIRECT_URI: process.env.WHATSAPP_REDIRECT_URI || '(using default Vercel URL)',
    },
    db: {
      status: 'unknown',
      tenantCount: 0,
      accountCount: 0,
      contactCount: 0,
      messageCount: 0,
      recentMessages: [],
    },
  };

  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM wa_incoming_messages');
    const tenantResult = await pool.query('SELECT COUNT(*) FROM tenants');
    const accountResult = await pool.query('SELECT COUNT(*) FROM accounts');
    const contactResult = await pool.query('SELECT COUNT(*) FROM contacts');
    const recentResult = await pool.query(
      'SELECT message_id, "from", from_name, body, timestamp FROM wa_incoming_messages ORDER BY created_at DESC LIMIT 5'
    );
    const connInfo = getDbConnectionInfo();
    info.db.status = '✅ Connected';
    info.db.activeHost = connInfo.activeHost;
    info.db.isUsingFallback = connInfo.isUsingFallback;
    info.db.messageCount = parseInt(countResult.rows[0].count, 10);
    info.db.tenantCount = parseInt(tenantResult.rows[0].count, 10);
    info.db.accountCount = parseInt(accountResult.rows[0].count, 10);
    info.db.contactCount = parseInt(contactResult.rows[0].count, 10);
    info.db.recentMessages = recentResult.rows;
  } catch (err: any) {
    info.db.status = `❌ DB Error: ${err.message}`;
  }

  res.json(info);
});


// WhatsApp endpoints
app.post('/api/whatsapp/connect', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { initWhatsApp } = await getWAService();
    initWhatsApp().catch(err => console.error('Error initializing WhatsApp:', err));
    res.json({ success: true, message: 'WhatsApp connection initiated' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/whatsapp/disconnect', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { destroyWhatsApp } = await getWAService();
    await destroyWhatsApp();
    res.json({ success: true, message: 'WhatsApp connection destroyed' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/whatsapp/status', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { getWhatsAppStatus } = await getWAService();
    res.json(getWhatsAppStatus());
  } catch {
    res.json({ status: 'disconnected', qr: '' });
  }
});

app.post('/api/whatsapp/set-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { setWhatsAppStatusManual } = await getWAService();
    const { status } = req.body;
    if (status) {
      setWhatsAppStatusManual(status);
    }
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

app.get('/api/whatsapp/sse', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.flushHeaders?.();

  // Send keepalive immediately
  res.write(':keepalive\n\n');

  try {
    const { getWhatsAppStatus, registerListener } = await getWAService();
    // Immediately send current state
    const { status, qr } = getWhatsAppStatus();
    res.write(`data: ${JSON.stringify({ status, qr })}\n\n`);

    const unsubscribe = registerListener((newStatus, newQr) => {
      res.write(`data: ${JSON.stringify({ status: newStatus, qr: newQr })}\n\n`);
    });

    const heartbeat = setInterval(() => {
      res.write(':keepalive\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  } catch {
    // If whatsapp service unavailable, send disconnected and close
    res.write(`data: ${JSON.stringify({ status: 'disconnected', qr: '' })}\n\n`);
    res.end();
  }
});

// ── Meta OAuth callback endpoint for Embedded Signup ─────────────────────────

app.get('/api/whatsapp/callback', (req: Request, res: Response): void => {
  const code = req.query.code || '';
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connecting...</title>
      </head>
      <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #F8FAFC; color: #334155;">
        <h2>Connecting to Omine Channel...</h2>
        <p>Please wait while we link your WhatsApp Business Account.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'META_ONBOARDING_SUCCESS', 
              code: "${code}",
              redirectUri: window.location.origin + window.location.pathname
            }, '*');
          }
          setTimeout(function() {
            window.close();
          }, 1000);
        </script>
      </body>
    </html>
  `);
});

app.post('/api/whatsapp/exchange-code', async (req: Request, res: Response): Promise<void> => {
  const { code, redirectUri: reqRedirectUri, redirect_uri } = req.body;
  const appId = process.env.WHATSAPP_APP_ID || '1501306521375669';
  const appSecret = process.env.WHATSAPP_APP_SECRET || 'b5aeb3f15a7babc5ee9bff096488bf8d';
  // Meta OAuth 2.0 requires redirect_uri in token exchange to exactly match the one used in the dialog request
  const redirectUri = reqRedirectUri || redirect_uri || process.env.WHATSAPP_REDIRECT_URI || `https://omine-channel-communication-system-opal.vercel.app/api/whatsapp/callback`;

  try {
    // 1. Exchange OAuth code for short-lived token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData: any = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Meta Token Exchange Error:', tokenData.error);
      res.status(400).json({ success: false, error: tokenData.error.message });
      return;
    }
    const shortLivedToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived permanent token
    const longLivedUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData: any = await longLivedResponse.json();
    
    if (longLivedData.error) {
      console.error('Meta Long Lived Token Error:', longLivedData.error);
      res.status(400).json({ success: false, error: longLivedData.error.message });
      return;
    }
    const permanentAccessToken = longLivedData.access_token;

    // 3. Get WABA ID (via debug_token since standard /me edges require BSP permissions)
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${permanentAccessToken}&access_token=${appId}|${appSecret}`;
    const debugResponse = await fetch(debugUrl);
    const debugData: any = await debugResponse.json();

    if (debugData.error) {
      console.error('Meta Get WABA Error (Debug Token):', debugData.error);
      res.status(400).json({ success: false, error: debugData.error.message });
      return;
    }

    const wabaScope = debugData.data?.granular_scopes?.find(
      (s: any) => s.scope === 'whatsapp_business_management'
    );
    const wabaId = wabaScope?.target_ids?.[0];

    if (!wabaId) {
      res.status(400).json({ success: false, error: 'No WhatsApp Business Account (WABA) permission found in scopes.' });
      return;
    }

    // 4. Get Phone Number ID
    const phoneUrl = `https://graph.facebook.com/v20.0/${wabaId}/phone_numbers?access_token=${permanentAccessToken}`;
    const phoneResponse = await fetch(phoneUrl);
    const phoneData: any = await phoneResponse.json();
    
    if (phoneData.error) {
      console.error('Meta Get Phone ID Error:', phoneData.error);
      res.status(400).json({ success: false, error: phoneData.error.message });
      return;
    }
    const phoneNumberId = phoneData.data?.[0]?.id;

    if (!phoneNumberId) {
      res.status(400).json({ success: false, error: 'No phone numbers registered in WABA.' });
      return;
    }

    // 5. Update process environment and write to both .env files
    process.env.WHATSAPP_ACCESS_TOKEN = permanentAccessToken;
    process.env.WHATSAPP_WABA_ID = wabaId;
    process.env.WHATSAPP_PHONE_NUMBER_ID = phoneNumberId;

    // Persist to .env files
    const dbUrl = process.env.DATABASE_URL || '';
    const envContent = 
      `DATABASE_URL="${dbUrl}"\n\n` +
      `WHATSAPP_ACCESS_TOKEN="${permanentAccessToken}"\n` +
      `WHATSAPP_PHONE_NUMBER_ID="${phoneNumberId}"\n` +
      `WHATSAPP_WABA_ID="${wabaId}"\n\n` +
      `WHATSAPP_APP_ID="${appId}"\n` +
      `WHATSAPP_APP_SECRET="${appSecret}"\n`;
    
    try {
      fs.writeFileSync('.env', envContent);
      fs.writeFileSync('server/.env', envContent);
    } catch (writeErr) {
      console.error('Failed to write credentials to .env files:', writeErr);
    }

    // 6. Subscribe WABA App to receive incoming messages via webhook
    const subscribeUrl = `https://graph.facebook.com/v20.0/${wabaId}/subscribed_apps`;
    await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${permanentAccessToken}`
      }
    });

    console.log('✅ Automated WhatsApp credentials successfully retrieved and updated in .env files.');
    
    res.json({ success: true });
  } catch (err: any) {
    console.error('Unhandled error inside exchange-code:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Webhook registration verification for Meta ────────────────────────────────

app.get('/api/whatsapp/webhook', (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  try {
    fs.appendFileSync(
      'webhook.log',
      `[${new Date().toISOString()}] Webhook GET query params:\n${JSON.stringify(req.query, null, 2)}\n\n`
    );
  } catch (err) {
    console.error('Failed to write GET request to webhook.log:', err);
  }

  if (mode === 'subscribe' && token === 'omine_token_123') {
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ── Incoming Webhook messages from Meta ───────────────────────────────────────

app.post('/api/whatsapp/webhook', async (req: Request, res: Response): Promise<void> => {
  const body = req.body;

  // Log payload to file for local debugging
  try {
    fs.appendFileSync(
      'webhook.log',
      `[${new Date().toISOString()}] Webhook POST payload:\n${JSON.stringify(body, null, 2)}\n\n`
    );
  } catch (err) {
    console.error('Failed to write to webhook.log:', err);
  }
  
  if (body.object === 'whatsapp_business_account') {
    try {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const contact = body.entry[0].changes[0].value.contacts?.[0];

        const incoming = {
          id: message.id,
          from: message.from,
          fromName: contact?.profile?.name || message.from,
          body: message.text?.body || '',
          timestamp: parseInt(message.timestamp, 10),
        };

        console.log(`Webhook received WhatsApp message from ${incoming.fromName}: ${incoming.body}`);

        // Persist message to database so frontend polling works on Vercel
        try {
          await initDb();
          await pool.query(
            `INSERT INTO wa_incoming_messages (message_id, "from", from_name, body, timestamp)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (message_id) DO NOTHING`,
            [incoming.id, incoming.from, incoming.fromName, incoming.body, incoming.timestamp]
          );
        } catch (dbErr) {
          console.error('Failed to save incoming message to DB:', dbErr);
        }
      }
    } catch (err) {
      console.error('Error parsing incoming webhook body:', err);
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// ── Poll endpoint: frontend fetches new messages since a given timestamp ───────

app.get('/api/whatsapp/messages/poll', async (req: Request, res: Response): Promise<void> => {
  try {
    const since = parseInt((req.query.since as string) || '0', 10);
    const result = await pool.query(
      `SELECT message_id AS id, "from", from_name AS "fromName", body, timestamp
       FROM wa_incoming_messages
       WHERE timestamp > $1
       ORDER BY timestamp ASC
       LIMIT 100`,
      [since]
    );
    res.json({ messages: result.rows });
  } catch (err: any) {
    console.error('Error polling messages:', err);
    res.status(500).json({ messages: [], error: err.message });
  }
});

// ── Send Outbound WhatsApp message via Meta Cloud API ──────────────────────────

app.post('/api/whatsapp/messages/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, message } = req.body;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!to || !message) {
      res.status(400).json({ error: 'to and message fields are required' });
      return;
    }

    if (!token || !phoneId) {
      res.status(500).json({ error: 'WhatsApp credentials are not configured on server' });
      return;
    }

    // Clean recipient number (remove non-digits or @c.us if passed)
    const cleanNumber = to.replace(/\D/g, '');

    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('Error response from Meta API:', data);
      res.status(response.status).json({ error: data.error?.message || 'Meta API error' });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error sending WhatsApp message:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Root — friendly landing page
app.get('/', (_req: Request, res: Response): void => {
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:50px;">
      <h1>🚀 Backend is Running</h1>
      <p>The backend server is active on port <strong>${PORT}</strong>.</p>
      <p>To view the <b>frontend</b>, go to:
        <a href="http://localhost:5173">http://localhost:5173</a>
      </p>
    </div>
  `);
});

// ── Register ──────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      organizationName,
      crNumber,
      website,
      industry,
      companySize,
    }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      organizationName?: string;
      crNumber?: string;
      website?: string;
      industry?: string;
      companySize?: string;
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Ensure database tables and schema are initialized
    await initDb();

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email in PostgreSQL
    const existingCheck = await pool.query(
      'SELECT id FROM tenants WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (existingCheck.rows.length > 0) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tenantId = Date.now().toString();

    // Insert tenant record into PostgreSQL
    await pool.query(
      `INSERT INTO tenants (
        id, email, password, first_name, last_name, organization_name,
        cr_number, website, business_industry, company_size, phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        tenantId,
        normalizedEmail,
        hashedPassword,
        firstName?.trim() || '',
        lastName?.trim() || '',
        organizationName?.trim() || 'QA Team',
        crNumber?.trim() || '',
        website?.trim() || '',
        industry?.trim() || '',
        companySize?.trim() || '',
        phone?.trim() || null,
      ]
    );

    console.log('Successfully registered and persisted tenant to DB:', normalizedEmail);

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error('Registration error:', {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      error: err.message || 'Database error occurred during registration',
    });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Ensure database tables and schema are initialized
    await initDb();

    const normalizedEmail = email.toLowerCase().trim();

    // Query tenant from PostgreSQL database
    const result = await pool.query(
      'SELECT * FROM tenants WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const tenant = result.rows[0];

    const isMatch = await bcrypt.compare(password, tenant.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Issue JWT
    const token = jwt.sign({ userId: tenant.id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: tenant.id,
        email: tenant.email,
        firstName: tenant.first_name || '',
        lastName: tenant.last_name || '',
        organizationName: tenant.organization_name || '',
        phone: tenant.phone || '',
        crNumber: tenant.cr_number || '',
        website: tenant.website || '',
        industry: tenant.business_industry || '',
        companySize: tenant.company_size || '',
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Database error occurred during login' });
  }
});

// ─── Tenant Isolation Middleware & Mappers ───────────────────────────────────

function mapAccountRow(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    website: row.website || '',
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    crNumber: row.cr_number || '',
    assignedTo: row.assigned_to || '',
    country: row.country || '',
    city: row.city || '',
    pincode: row.pincode || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

function mapContactRow(row: any) {
  return {
    id: row.id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    email: row.email || '',
    contactNumber: row.contact_number || '',
    address: row.address || '',
    city: row.city || '',
    nationalId: row.national_id || '',
    country: row.country || '',
    accountName: row.account_name || '',
    assignedTo: row.assigned_to || '',
    lifecycle: row.lifecycle || 'NA',
    labels: row.labels || '',
    avatarUrl: row.avatar_url || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

const authenticateTenant = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    let tenantId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; id?: string };
        tenantId = decoded.userId || decoded.id || null;
      } catch {
        if (token.startsWith('fake_local_token_') && req.headers['x-tenant-id']) {
          tenantId = String(req.headers['x-tenant-id']).trim();
        }
      }
    }

    if (!tenantId && req.headers['x-tenant-id']) {
      tenantId = String(req.headers['x-tenant-id']).trim();
    }

    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
      return;
    }

    req.tenantId = tenantId;
    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Unauthorized: Authentication failure' });
  }
};

// ─── Accounts CRUD Endpoints (Multi-Tenant) ───────────────────────────────────

// GET /api/accounts - List all accounts for current tenant
app.get('/api/accounts', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const result = await pool.query(
      'SELECT * FROM accounts WHERE tenant_id = $1 ORDER BY created_at DESC',
      [req.tenantId]
    );
    res.json(result.rows.map(mapAccountRow));
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch accounts' });
  }
});

// POST /api/accounts - Create or upsert account for current tenant
app.post('/api/accounts', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const {
      id,
      name,
      website,
      email,
      phone,
      address,
      crNumber,
      assignedTo,
      country,
      city,
      pincode,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Account name is required' });
      return;
    }

    const accountId = id?.trim() || `acc${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO accounts (
        id, tenant_id, name, website, email, phone, address,
        cr_number, assigned_to, country, city, pincode, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        website = EXCLUDED.website,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        cr_number = EXCLUDED.cr_number,
        assigned_to = EXCLUDED.assigned_to,
        country = EXCLUDED.country,
        city = EXCLUDED.city,
        pincode = EXCLUDED.pincode,
        updated_at = NOW()
      WHERE accounts.tenant_id = $2
      RETURNING *`,
      [
        accountId,
        req.tenantId,
        name.trim(),
        website?.trim() || '',
        email?.trim() || '',
        phone?.trim() || '',
        address?.trim() || '',
        crNumber?.trim() || '',
        assignedTo?.trim() || '',
        country?.trim() || '',
        city?.trim() || '',
        pincode?.trim() || '',
      ]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden: Cannot overwrite an account belonging to another tenant' });
      return;
    }

    res.status(201).json(mapAccountRow(result.rows[0]));
  } catch (error: any) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

// PUT /api/accounts/:id - Edit / Update account for current tenant
app.put('/api/accounts/:id', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const { id } = req.params;
    const {
      name,
      website,
      email,
      phone,
      address,
      crNumber,
      assignedTo,
      country,
      city,
      pincode,
    } = req.body;

    const result = await pool.query(
      `UPDATE accounts SET
        name = COALESCE($3, name),
        website = COALESCE($4, website),
        email = COALESCE($5, email),
        phone = COALESCE($6, phone),
        address = COALESCE($7, address),
        cr_number = COALESCE($8, cr_number),
        assigned_to = COALESCE($9, assigned_to),
        country = COALESCE($10, country),
        city = COALESCE($11, city),
        pincode = COALESCE($12, pincode),
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *`,
      [
        id,
        req.tenantId,
        name !== undefined ? name.trim() : null,
        website !== undefined ? website.trim() : null,
        email !== undefined ? email.trim() : null,
        phone !== undefined ? phone.trim() : null,
        address !== undefined ? address.trim() : null,
        crNumber !== undefined ? crNumber.trim() : null,
        assignedTo !== undefined ? assignedTo.trim() : null,
        country !== undefined ? country.trim() : null,
        city !== undefined ? city.trim() : null,
        pincode !== undefined ? pincode.trim() : null,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Account not found or unauthorized' });
      return;
    }

    res.json(mapAccountRow(result.rows[0]));
  } catch (error: any) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: error.message || 'Failed to update account' });
  }
});

// POST /api/accounts/delete-batch - Batch delete accounts for current tenant
app.post('/api/accounts/delete-batch', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Array of ids is required for batch delete' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM accounts WHERE id = ANY($1) AND tenant_id = $2 RETURNING id',
      [ids, req.tenantId]
    );

    res.json({
      success: true,
      message: `Deleted ${result.rows.length} accounts`,
      deletedIds: result.rows.map((r: any) => r.id),
    });
  } catch (error: any) {
    console.error('Error batch deleting accounts:', error);
    res.status(500).json({ error: error.message || 'Failed to delete accounts' });
  }
});

// DELETE /api/accounts/:id - Delete single account for current tenant
app.delete('/api/accounts/:id', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM accounts WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, req.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Account not found or unauthorized' });
      return;
    }

    res.json({ success: true, message: 'Account deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
});

// ─── Contacts CRUD Endpoints (Multi-Tenant) ───────────────────────────────────

// GET /api/contacts - List all contacts for current tenant
app.get('/api/contacts', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const result = await pool.query(
      'SELECT * FROM contacts WHERE tenant_id = $1 ORDER BY created_at DESC',
      [req.tenantId]
    );
    res.json(result.rows.map(mapContactRow));
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch contacts' });
  }
});

// POST /api/contacts - Create or upsert contact for current tenant
app.post('/api/contacts', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const {
      id,
      firstName,
      lastName,
      email,
      contactNumber,
      address,
      city,
      nationalId,
      country,
      accountName,
      assignedTo,
      lifecycle,
      labels,
      avatarUrl,
    } = req.body;

    const contactId = id?.trim() || `con${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO contacts (
        id, tenant_id, first_name, last_name, email, contact_number, address,
        city, national_id, country, account_name, assigned_to, lifecycle, labels, avatar_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        contact_number = EXCLUDED.contact_number,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        national_id = EXCLUDED.national_id,
        country = EXCLUDED.country,
        account_name = EXCLUDED.account_name,
        assigned_to = EXCLUDED.assigned_to,
        lifecycle = EXCLUDED.lifecycle,
        labels = EXCLUDED.labels,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
      WHERE contacts.tenant_id = $2
      RETURNING *`,
      [
        contactId,
        req.tenantId,
        firstName?.trim() || '',
        lastName?.trim() || '',
        email?.trim() || '',
        contactNumber?.trim() || '',
        address?.trim() || '',
        city?.trim() || '',
        nationalId?.trim() || '',
        country?.trim() || '',
        accountName?.trim() || '',
        assignedTo?.trim() || 'Unassigned',
        lifecycle?.trim() || 'NA',
        labels?.trim() || '',
        avatarUrl?.trim() || '',
      ]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden: Cannot overwrite a contact belonging to another tenant' });
      return;
    }

    res.status(201).json(mapContactRow(result.rows[0]));
  } catch (error: any) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: error.message || 'Failed to create contact' });
  }
});

// PUT /api/contacts/:id - Edit / Update contact for current tenant
app.put('/api/contacts/:id', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      address,
      city,
      nationalId,
      country,
      accountName,
      assignedTo,
      lifecycle,
      labels,
      avatarUrl,
    } = req.body;

    const result = await pool.query(
      `UPDATE contacts SET
        first_name = COALESCE($3, first_name),
        last_name = COALESCE($4, last_name),
        email = COALESCE($5, email),
        contact_number = COALESCE($6, contact_number),
        address = COALESCE($7, address),
        city = COALESCE($8, city),
        national_id = COALESCE($9, national_id),
        country = COALESCE($10, country),
        account_name = COALESCE($11, account_name),
        assigned_to = COALESCE($12, assigned_to),
        lifecycle = COALESCE($13, lifecycle),
        labels = COALESCE($14, labels),
        avatar_url = COALESCE($15, avatar_url),
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *`,
      [
        id,
        req.tenantId,
        firstName !== undefined ? firstName.trim() : null,
        lastName !== undefined ? lastName.trim() : null,
        email !== undefined ? email.trim() : null,
        contactNumber !== undefined ? contactNumber.trim() : null,
        address !== undefined ? address.trim() : null,
        city !== undefined ? city.trim() : null,
        nationalId !== undefined ? nationalId.trim() : null,
        country !== undefined ? country.trim() : null,
        accountName !== undefined ? accountName.trim() : null,
        assignedTo !== undefined ? assignedTo.trim() : null,
        lifecycle !== undefined ? lifecycle.trim() : null,
        labels !== undefined ? labels.trim() : null,
        avatarUrl !== undefined ? avatarUrl.trim() : null,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Contact not found or unauthorized' });
      return;
    }

    res.json(mapContactRow(result.rows[0]));
  } catch (error: any) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: error.message || 'Failed to update contact' });
  }
});

// POST /api/contacts/delete-batch - Batch delete contacts for current tenant
app.post('/api/contacts/delete-batch', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Array of ids is required for batch delete' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM contacts WHERE id = ANY($1) AND tenant_id = $2 RETURNING id',
      [ids, req.tenantId]
    );

    res.json({
      success: true,
      message: `Deleted ${result.rows.length} contacts`,
      deletedIds: result.rows.map((r: any) => r.id),
    });
  } catch (error: any) {
    console.error('Error batch deleting contacts:', error);
    res.status(500).json({ error: error.message || 'Failed to delete contacts' });
  }
});

// DELETE /api/contacts/:id - Delete single contact for current tenant
app.delete('/api/contacts/:id', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, req.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Contact not found or unauthorized' });
      return;
    }

    res.json({ success: true, message: 'Contact deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: error.message || 'Failed to delete contact' });
  }
});

// ─── Tickets (list, details, comments) ────────────────────────────────────────

function mapTicketCommentRow(row: any) {
  return {
    id: row.id,
    userName: row.user_name || '',
    content: row.content || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapTicketRow(row: any, comments: ReturnType<typeof mapTicketCommentRow>[] = []) {
  return {
    id: row.id,
    ticketNo: row.ticket_no || '',
    subject: row.subject || '',
    description: row.description || '',
    contactId: row.contact_id || '',
    contactName: row.contact_name || '',
    accountId: row.account_id || '',
    accountName: row.account_name || '',
    status: row.status || 'Open',
    priority: row.priority || 'Normal',
    assignedTo: row.assigned_to || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    lastActivity: row.last_activity ? new Date(row.last_activity).toISOString() : undefined,
    comments,
  };
}

async function loadTenantTickets(tenantId: string) {
  const ticketResult = await pool.query(
    'SELECT * FROM tickets WHERE tenant_id = $1 ORDER BY created_at DESC',
    [tenantId]
  );
  const commentResult = await pool.query(
    `SELECT c.* FROM ticket_comments c
     INNER JOIN tickets t ON t.id = c.ticket_id
     WHERE t.tenant_id = $1
     ORDER BY c.created_at ASC`,
    [tenantId]
  );
  const commentsByTicket = new Map<string, ReturnType<typeof mapTicketCommentRow>[]>();
  for (const row of commentResult.rows) {
    const list = commentsByTicket.get(row.ticket_id) || [];
    list.push(mapTicketCommentRow(row));
    commentsByTicket.set(row.ticket_id, list);
  }
  return ticketResult.rows.map((row: any) => mapTicketRow(row, commentsByTicket.get(row.id) || []));
}

async function replaceTicketComments(tenantId: string, ticketId: string, comments: any[] = []) {
  await pool.query('DELETE FROM ticket_comments WHERE ticket_id = $1 AND tenant_id = $2', [ticketId, tenantId]);
  for (const comment of comments) {
    if (!comment?.content) continue;
    await pool.query(
      `INSERT INTO ticket_comments (id, tenant_id, ticket_id, user_name, content, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        comment.id || `cmt${Date.now()}`,
        tenantId,
        ticketId,
        comment.userName || '',
        comment.content,
        comment.createdAt ? new Date(comment.createdAt) : new Date(),
      ]
    );
  }
}

app.get('/api/tickets', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    res.json(await loadTenantTickets(req.tenantId!));
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
  }
});

app.post('/api/tickets', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    await initDb();
    const body = req.body || {};
    if (!body.subject || !String(body.subject).trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const ticketId = body.id?.trim() || `tkt${Date.now()}`;
    const ticketNo = body.ticketNo || `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const result = await pool.query(
      `INSERT INTO tickets (
        id, tenant_id, ticket_no, subject, description, contact_id, contact_name,
        account_id, account_name, status, priority, assigned_to, last_activity, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,COALESCE($14,NOW()),NOW())
      ON CONFLICT (id) DO UPDATE SET
        ticket_no = EXCLUDED.ticket_no,
        subject = EXCLUDED.subject,
        description = EXCLUDED.description,
        contact_id = EXCLUDED.contact_id,
        contact_name = EXCLUDED.contact_name,
        account_id = EXCLUDED.account_id,
        account_name = EXCLUDED.account_name,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        assigned_to = EXCLUDED.assigned_to,
        last_activity = EXCLUDED.last_activity,
        updated_at = NOW()
      WHERE tickets.tenant_id = $2
      RETURNING *`,
      [
        ticketId,
        req.tenantId,
        ticketNo,
        String(body.subject).trim(),
        body.description || '',
        body.contactId || '',
        body.contactName || '',
        body.accountId || '',
        body.accountName || '',
        body.status || 'Open',
        body.priority || 'Normal',
        body.assignedTo || '',
        body.lastActivity ? new Date(body.lastActivity) : new Date(),
        body.createdAt ? new Date(body.createdAt) : null,
      ]
    );
    if (result.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    if (Array.isArray(body.comments)) {
      await replaceTicketComments(req.tenantId!, ticketId, body.comments);
    }
    const tickets = await loadTenantTickets(req.tenantId!);
    res.status(201).json(tickets.find((ticket) => ticket.id === ticketId));
  } catch (error: any) {
    console.error('Error saving ticket:', error);
    res.status(500).json({ error: error.message || 'Failed to save ticket' });
  }
});

app.put('/api/tickets/:id', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  req.body = { ...req.body, id: req.params.id };
  try {
    await initDb();
    const body = req.body || {};
    const result = await pool.query(
      `UPDATE tickets SET
        ticket_no = COALESCE($3, ticket_no),
        subject = COALESCE($4, subject),
        description = COALESCE($5, description),
        contact_id = COALESCE($6, contact_id),
        contact_name = COALESCE($7, contact_name),
        account_id = COALESCE($8, account_id),
        account_name = COALESCE($9, account_name),
        status = COALESCE($10, status),
        priority = COALESCE($11, priority),
        assigned_to = COALESCE($12, assigned_to),
        last_activity = COALESCE($13, last_activity),
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *`,
      [
        req.params.id,
        req.tenantId,
        body.ticketNo ?? null,
        body.subject ?? null,
        body.description ?? null,
        body.contactId ?? null,
        body.contactName ?? null,
        body.accountId ?? null,
        body.accountName ?? null,
        body.status ?? null,
        body.priority ?? null,
        body.assignedTo ?? null,
        body.lastActivity ? new Date(body.lastActivity) : new Date(),
      ]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    if (Array.isArray(body.comments)) {
      await replaceTicketComments(req.tenantId!, req.params.id, body.comments);
    }
    const tickets = await loadTenantTickets(req.tenantId!);
    res.json(tickets.find((ticket) => ticket.id === req.params.id));
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message || 'Failed to update ticket' });
  }
});

app.post('/api/tickets/delete-batch', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) {
      res.json({ deleted: 0 });
      return;
    }
    await pool.query('DELETE FROM tickets WHERE tenant_id = $1 AND id = ANY($2::varchar[])', [req.tenantId, ids]);
    res.json({ deleted: ids.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete tickets' });
  }
});

app.delete('/api/tickets/:id', authenticateTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('DELETE FROM tickets WHERE id = $1 AND tenant_id = $2 RETURNING id', [req.params.id, req.tenantId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete ticket' });
  }
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
  console.log(`    Frontend proxy → http://localhost:5173`);
});

// ─── Process error guards ─────────────────────────────────────────────────────

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
