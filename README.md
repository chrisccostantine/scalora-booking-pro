# Scalora Booking Pro

A reusable full-stack SaaS-style booking website template for salons, clinics, gyms, tutors, beauty centers, real estate agents, car washes, and other local service businesses.

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

Default seeded admin:

- Email: `admin@scalora.local`
- Password: `Admin123!`

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

## Environment

Backend values can be supplied through environment variables:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `FRONTEND_ORIGIN`

Frontend:

- `VITE_API_BASE_URL`
