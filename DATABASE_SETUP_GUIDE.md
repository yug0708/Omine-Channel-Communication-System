# Database Setup & Multi-Environment Guide (Dev vs Main)

This guide explains how the database is structured for this project, how `dev` and `main` databases are kept isolated with 100% identical schema, and how tenant creation and login work properly in both environments.

---

## 1. Overview of the Database Architecture

1. **Schema Definition**: [`server/src/db/schema.sql`](file:///c:/Users/QA/Downloads/Omine-Channel-Communication-System-main/Omine-Channel-Communication-System-main/server/src/db/schema.sql)
   - **`tenants` table**: Stores all user registrations, organization information, contact details, and bcrypt-hashed passwords.
   - **`wa_incoming_messages` table**: Stores incoming WhatsApp messages from Meta webhooks so polling continues smoothly across serverless calls.
   - **Default Admin Seed**: Automatically ensures `yugshah82@gmail.com` with password `Variance@2025` is present in both dev and prod databases.

2. **Self-Healing on Startup**:
   - Every time the backend server or Vercel serverless function spins up, [`initDb()`](file:///c:/Users/QA/Downloads/Omine-Channel-Communication-System-main/Omine-Channel-Communication-System-main/server/src/db/index.ts) runs idempotently (`CREATE TABLE IF NOT EXISTS...`).
   - This means even if you connect a brand new database instance, the schema and default admin will be created automatically without any manual SQL execution needed.

3. **Migration Command**:
   - You can also trigger migrations manually or via CI at any time:
     ```bash
     npm run db:migrate
     ```

---

## 2. Dev vs Main Database Separation

To keep your Development data separate from your Production data while maintaining the **exact same structure**, you use two separate PostgreSQL databases or Neon branches:

```
                  ┌─────────────────────────────────────┐
                  │ server/src/db/schema.sql (Source)   │
                  └──────────────────┬──────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │     Dev Database        │             │      Main Database      │
    │  (Development / Local)  │             │   (Production / Live)   │
    ├─────────────────────────┤             ├─────────────────────────┤
    │ - tenants table         │             │ - tenants table         │
    │ - wa_incoming_messages  │             │ - wa_incoming_messages  │
    │ - Isolated test data    │             │ - Real production data  │
    └─────────────────────────┘             └─────────────────────────┘
```

### Option A: Using Neon Branches (Recommended)
1. Go to your [Neon Console](https://console.neon.tech).
2. Under your Project, open the **Branches** tab.
3. Your primary branch is `main` (this is your production database).
4. Click **New Branch** and name it `dev` (this creates an isolated database with the same schema).
5. Copy the connection string for each branch:
   - `main` branch connection string → **Production / Main**
   - `dev` branch connection string → **Development / Dev**

### Option B: Using Two Separate Databases
Create two PostgreSQL databases (e.g. `omine_dev` and `omine_prod`). Run `npm run db:migrate` against each using `DATABASE_URL` to create the tables.

---

## 3. Configuring Vercel (Frontend & Backend Hosting)

In your Vercel Dashboard for this project:

1. Go to **Settings** → **Environment Variables**.
2. Add `DATABASE_URL`:
   - Value: Your **Dev Neon Database URL**
   - Scope: Check **Development** and **Preview**
3. Add `DATABASE_URL` again:
   - Value: Your **Production / Main Neon Database URL**
   - Scope: Check **Production**

Now, any push to `main` branch deployed to production will connect to the Main database, while preview deployments and local dev connect to the Dev database.

---

## 4. Configuring GitHub Actions CI/CD Pipeline

The automated pipeline [`.github/workflows/ci.yml`](file:///c:/Users/QA/Downloads/Omine-Channel-Communication-System-main/Omine-Channel-Communication-System-main/.github/workflows/ci.yml) validates your frontend and backend builds and runs migrations whenever you push:

1. Go to your GitHub repository: `https://github.com/yug0708/Omine-Channel-Communication-System`
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Under **Repository secrets**, click **New repository secret**:
   - `MAIN_DATABASE_URL`: Paste your production / main database connection string.
   - `DEV_DATABASE_URL`: Paste your dev database connection string.

Whenever you push code to `main`, GitHub Actions will:
1. Build and verify the frontend (`npm run build`).
2. Build and verify the backend (`npm run build:backend`).
3. Run `npm run db:migrate` against `MAIN_DATABASE_URL` so your production database structure is updated automatically.

---

## 5. Tenant Registration & Login Flow

- **Sign Up / Registration**:
  - Visit `/register` on the frontend.
  - Fill in Step 1 (Personal details, password) and Step 2 (Company details).
  - On submit, `/api/auth/register` creates a record in the `tenants` table with a secure bcrypt password hash.
- **Sign In / Login**:
  - Visit `/login`.
  - Enter the registered email and password.
  - `/api/auth/login` checks the database, verifies the bcrypt password hash, and issues a JWT token.
  - Works identically in both local development, preview, and production.
