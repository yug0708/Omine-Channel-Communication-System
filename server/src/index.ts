import express from 'express'; // Triggering TS re-scan after schema update
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
});

let prisma: PrismaClient;

try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set in environment variables');
    }

    const pool = new Pool({ connectionString: DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ 
        adapter,
        log: ['query', 'info', 'warn', 'error'],
    });
    console.log('Successfully initialized PrismaClient with adapter');
} catch (error: any) {
    console.error('CRITICAL: Failed to initialize PrismaClient:', error.message);
    console.log('Available environment variables:', Object.keys(process.env).join(', '));
    // Create a dummy proxy to prevent top-level crashes, but throw errors on actual API calls
    prisma = new Proxy({} as PrismaClient, {
        get(target, prop) {
            return () => { throw new Error('Database connection failed to initialize. Check environment variables.'); }
        }
    }); 
}

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running!' });
});

// Example route: get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
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
            companySize
        } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save everything to the Tenant table
        const tenant = await prisma.tenant.create({
            data: {
                organizationName,
                crNumber,
                website,
                businessIndustry: industry,
                companySize,
                firstName: firstName || '',
                lastName: lastName || '',
                email,
                phone: phone || null,
                password: hashedPassword
            }
        });

        console.log('Successfully registered tenant:', email);
        res.status(201).json({ 
            success: true,
            message: 'Tenant registered successfully' 
        });
    } catch (error: any) {
        console.error('Registration error detailed:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Return a more descriptive JSON error
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check authentication against the Tenant table
        const tenant = await (prisma as any).tenant.findUnique({ 
            where: { email }
        });
        if (!tenant) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, tenant.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Issue JWT token (using tenant ID)
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
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
