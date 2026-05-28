import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

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
