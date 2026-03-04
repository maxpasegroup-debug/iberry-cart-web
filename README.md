# iBerryCart - Production E-commerce Platform

Full-stack ecommerce implementation using:

- Next.js App Router
- Tailwind CSS (mobile-first)
- MongoDB + Mongoose
- Razorpay integration
- Admin panel under `/admin`

## Core Routes

- `/` Home
- `/products`
- `/products/[slug]`
- `/categories/[slug]`
- `/cart`
- `/checkout`
- `/account`
- `/auth/login`
- `/auth/register`
- `/order/[id]/success`
- `/admin` + admin module routes

## API Routes

- `GET /api/products`
- `GET /api/products/[slug]`
- `GET /api/categories`
- `GET /api/cart`
- `POST /api/cart`
- `PATCH /api/cart`
- `POST /api/orders`
- `GET /api/orders/[id]`
- `POST /api/payment/create-order`
- `POST /api/payment/verify`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET/POST /api/address`
- Admin APIs:
  - `/api/admin/products`
  - `/api/admin/categories`
  - `/api/admin/orders`
  - `/api/admin/inventory`
  - `/api/admin/vendors`
  - `/api/admin/overview`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill values in `.env.local`:

- `MONGODB_URI`
- `MONGODB_DB`
- `JWT_SECRET`
- `ADMIN_TOKEN`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

4. Start development server:

```bash
npm run dev
```

5. Open:

- [http://localhost:3000](http://localhost:3000)

6. Validate quality:

```bash
npm run lint
npm run build
```

## Admin Access

- Login URL: `/auth/login`
- Seeded admin credentials:
  - Email: `admin@iberrycart.com`
  - Password: `qwerty`

This admin account is auto-created when MongoDB is connected and login is attempted.

## Railway Deployment

1. Push project to GitHub.
2. Create a new Railway project and connect the GitHub repository.
3. Add these Railway environment variables:
   - `MONGODB_URI`
   - `MONGODB_DB`
   - `JWT_SECRET`
   - `ADMIN_TOKEN`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_APP_URL` (Railway public URL)
4. Set build and start commands:
   - Build: `npm run build`
   - Start: `npm run start`
5. Deploy.
6. Add Razorpay webhook URL:
   - `https://<your-railway-domain>/api/payment/verify` (or dedicated webhook route if extended later)

## Notes

- API responses follow a consistent format:
  - success: `{ ok: true, data, message? }`
  - failure: `{ ok: false, error, details? }`
- Security headers + API rate-limiting are applied via `proxy.ts`.
- `app/sitemap.ts` and `app/robots.ts` are configured for SEO.
