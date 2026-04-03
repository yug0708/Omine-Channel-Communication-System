import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

// Temporary in-memory stores to completely remove database requirement
const tenants: any[] = [
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
        password: bcrypt.hashSync('Variance@2025', 10)
    }
];
const users: any[] = [];

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running!' });
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
        const existingUser = tenants.find(t => t.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save everything to the Tenant array
        const tenant = {
            id: Date.now().toString(),
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
        };
        tenants.push(tenant);

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

        // Check authentication against the Tenant array
        const tenant = tenants.find(t => t.email === email);
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
