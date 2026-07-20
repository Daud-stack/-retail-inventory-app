# NEXUS RETAIL INVENTORY MULTI-PLATFORM DEPLOYMENT GUIDE

This guide walks you through deploying the **Database**, **Backend API Service**, and **Frontend Dashboard** across **Neon**, **Render**, and **Vercel**.

---

## 1. Database Deployment: Neon PostgreSQL (`Neon.tech`)

**Role**: Serverless PostgreSQL database with automatic scaling and instant database branching.

### Steps:
1. **Create Neon Database**:
   - Go to [Neon Console](https://console.neon.tech) and create a new project named `nexus-retail-db`.
   - Copy your PostgreSQL connection string from the dashboard:
     ```env
     postgresql://neondb_owner:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
2. **Run Migration Scripts**:
   - In the Neon SQL Editor (or via `psql`), execute the contents of:
     - [`db/01_schema.sql`](file:///C:/Users/daud/retail-inventory-app/db/01_schema.sql) (Creates `products`, `inventory`, `pricing`, `invoices`, `invoice_items`, `stock_movements`).
     - [`db/02_seed.sql`](file:///C:/Users/daud/retail-inventory-app/db/02_seed.sql) (Populates initial mock items across Clothing, Groceries, and Miscellaneous).

---

## 2. Backend Services Deployment: Render (`Render.com`)

**Role**: Persistent Node/Express API service handling long-running background updates, checkout transaction processing, and stock movement logs.

### Steps:
1. **Push Code to GitHub / GitLab**.
2. **Create New Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com) -> **New +** -> **Web Service** (or Blueprint using `render.yaml`).
   - Connect your repository.
3. **Configuration Settings**:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
4. **Environment Variables**:
   Add the following under **Environment**:
   - `DATABASE_URL`: Your Neon connection string.
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
5. **Deploy**:
   - Click **Create Web Service**. Render will deploy your API at:
     `https://nexus-inventory-backend.onrender.com`

---

## 3. Frontend Hosting Deployment: Vercel (`Vercel.com`)

**Role**: Fast Edge CDN hosting for the web-based inventory dashboard and POS checkout.

### Steps:
1. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new) and select your GitHub repository.
2. **Framework Preset**:
   - Select **Vite** (Vercel automatically detects `vercel.json` and `vite.config.js`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   Add under **Environment Variables**:
   - `VITE_API_URL`: `https://nexus-inventory-backend.onrender.com` (Your Render backend URL).
4. **Deploy**:
   - Click **Deploy**. Vercel will build and publish your live app on an SSL domain (e.g. `https://nexus-inventory-app.vercel.app`).

---

## Architecture Flow Overview

```
 ┌───────────────────────────────────────┐
 │            VERCEL CDN                 │
 │     Web App Frontend (Vite/React)     │
 └──────────────────┬────────────────────┘
                    │ HTTPS API Requests
                    ▼
 ┌───────────────────────────────────────┐
 │            RENDER WEB SERVICE         │
 │    Node / Express Persistent API      │
 └──────────────────┬────────────────────┘
                    │ WebSocket / TCP SSL
                    ▼
 ┌───────────────────────────────────────┐
 │            NEON SERVERLESS DB         │
 │     PostgreSQL Multi-Table Schema     │
 └───────────────────────────────────────┘
```
