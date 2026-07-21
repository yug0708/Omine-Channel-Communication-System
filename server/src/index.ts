import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

import fs from 'fs';
dotenv.config();

// ─── PostgreSQL client ────────────────────────────────────────────────────────

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Ensure the incoming messages table exists on first use
async function ensureMessagesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wa_incoming_messages (
      id SERIAL PRIMARY KEY,
      message_id TEXT UNIQUE,
      "from" TEXT NOT NULL,
      from_name TEXT,
      body TEXT,
      timestamp BIGINT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
ensureMessagesTable().catch(err => console.error('Failed to ensure wa_incoming_messages table:', err));

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

// ─── In-memory store (no database required) ───────────────────────────────────

const tenants: Tenant[] = [
  {
    id: 'default_tenant',
    organizationName: 'Default Org',
    crNumber: '',
    website: '',
    businessIndustry: '',
    companySize: '',
    firstName: 'Default',
    lastName: 'User',
    email: 'yugshah82@gmail.com',
    phone: null,
    password: bcrypt.hashSync('Variance@2025', 10),
  },
];

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
    db: { status: 'unknown', messageCount: 0, recentMessages: [] },
  };

  try {
    await ensureMessagesTable();
    const countResult = await pool.query('SELECT COUNT(*) FROM wa_incoming_messages');
    const recentResult = await pool.query(
      'SELECT message_id, "from", from_name, body, timestamp FROM wa_incoming_messages ORDER BY created_at DESC LIMIT 5'
    );
    info.db.status = '✅ Connected';
    info.db.messageCount = parseInt(countResult.rows[0].count, 10);
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
            window.opener.postMessage({ type: 'META_ONBOARDING_SUCCESS', code: "${code}" }, '*');
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
  const { code } = req.body;
  const appId = process.env.WHATSAPP_APP_ID || '1501306521375669';
  const appSecret = process.env.WHATSAPP_APP_SECRET || 'b5aeb3f15a7babc5ee9bff096488bf8d';
  const redirectUri = process.env.WHATSAPP_REDIRECT_URI || `https://omine-channel-communication-system-opal.vercel.app/api/whatsapp/callback`;

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
          await ensureMessagesTable();
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

    // Check duplicate email
    const existingUser = tenants.find((t) => t.email === email);
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create tenant record
    const tenant: Tenant = {
      id: Date.now().toString(),
      organizationName: organizationName ?? 'QA Team',
      crNumber: crNumber ?? '123456',
      website: website ?? 'https://www.google.com',
      businessIndustry: industry ?? '',
      companySize: companySize ?? '100-500',
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      email,
      phone: phone ?? null,
      password: hashedPassword,
    };

    tenants.push(tenant);
    console.log('Successfully registered tenant:', email);

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
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
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

    const tenant = tenants.find((t) => t.email === email);
    if (!tenant) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

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
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        organizationName: tenant.organizationName,
        phone: tenant.phone,
        crNumber: tenant.crNumber,
        website: tenant.website,
        industry: tenant.businessIndustry,
        companySize: tenant.companySize,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
