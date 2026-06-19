# Scalora Booking Pro

A reusable full-stack SaaS-style booking website template for salons, clinics, gyms, tutors, beauty centers, real estate agents, car washes, and other local service businesses.

The platform supports multiple businesses under one Scalora domain. Each business gets a public profile URL with its own branding, services, staff, testimonials, booking form, contact details, and business information.

Example public profile links:

- `https://scalorabooking.com/b/edgard-akar`
- `https://scalorabooking.com/b/marka-store`
- `https://scalorabooking.com/b/clinic-name`

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Java Spring Boot, Spring Security, JWT
- Database: PostgreSQL by default, MySQL compatible with driver/config changes
- API: REST

## Project Structure

```text
frontend/   React public website and admin dashboard
backend/    Spring Boot REST API with layered architecture
```

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

Default seeded admin is created from environment variables.

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

Admin access:

- Main Scalora admin dashboard: `/#admin`
- Business admin dashboard: `/#admin`
- The dashboard changes behavior based on the logged-in role.

`SUPER_ADMIN` can create and manage all businesses, create business-admin accounts, manage business images, and edit any business availability. `BUSINESS_ADMIN` can only manage the assigned business.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## API Highlights

- `POST /api/auth/login`
- `GET /api/services`
- `POST /api/bookings`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/{id}/status`
- `POST /api/admin/services`
- `PUT /api/admin/services/{id}`
- `DELETE /api/admin/services/{id}`
- `GET /api/testimonials`
- `POST /api/contact`
- `GET /api/businesses`
- `GET /api/businesses/{slug}`
- `GET /api/businesses/{slug}/services`
- `GET /api/businesses/{slug}/staff`
- `POST /api/businesses/{slug}/contact`
- `GET /api/admin/businesses`
- `POST /api/admin/businesses`
- `POST /api/admin/business-admins`
- `GET /api/admin/availability`
- `POST /api/admin/availability`
- `GET /api/businesses/{slug}/availability-slots`

## Environment

Backend values can be supplied through environment variables:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `FRONTEND_ORIGIN`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

Frontend:

- `VITE_API_BASE_URL`
