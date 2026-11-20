# Agriculture Management System

Full-stack farm management app built for U Devs Batch 6.

- **Backend:** Node.js, Express, PostgreSQL, Sequelize, JWT, bcrypt, Multer
- **Frontend:** React (Vite), Redux Toolkit, React Router, Axios

Built by: **Syed Mesum** (Batch 6)

## Features
- Signup, login, logout with JWT. New signups are Managers.
- Two roles: **Admin** (full access) and **Manager** (view and add only). The server enforces it, and the UI hides Edit/Delete for managers.
- 11 modules: Crops, Orders, Buyers (with photo upload), Tasks, Expenses, Inventory, Workers, Attendance, Equipment, Maintenance, Activity log, plus Users (admin only).
- Dashboard with live totals (crop health, harvest, expenses, pending tasks, low stock, workers, equipment).
- Search, confirm-before-delete dialogs, and server error messages in the UI.
- Buyer rules: letters-only name, CNIC format `12345-1234567-1`, unique CNIC, photo required (JPG/PNG, max 1 MB), quantity cannot exceed available stock.

## Setup

### 1. Database
Install PostgreSQL and pgAdmin, then create a database (for example `technodevs37`).

### 2. Backend
```
cd backend
copy .env.example .env      (then fill in your values)
npm install express cors helmet dotenv sequelize pg pg-hstore bcryptjs jsonwebtoken multer morgan express-rate-limit
npm install --save-dev nodemon
npm run test:db             (must print: PostgreSQL connected successfully)
npm run dev                 (API on http://localhost:5000, creates the tables)
npm run seed                (in a second terminal: demo users and data)
```

`.env` keys: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `JWT_SECRET`, `PORT_NAME`.

### 3. Frontend
```
cd frontend
npm install
npm run dev                 (opens on http://localhost:5173)
```
Optional: copy `.env.example` to `.env` to change the API address (default `http://localhost:5000/api`).

## Demo accounts
| Role | Username | Password |
|---|---|---|
| Admin | admin | Admin@123 |
| Manager | manager | Manager@123 |

## API overview
All routes are under `/api`. Responses look like `{ succeeded, message, data }`.

| Area | Endpoints |
|---|---|
| Auth | POST `/users/register`, `/users/login`, `/users/logout`, `/users/change-password`, GET `/users/me` |
| Users (admin) | GET/POST `/users`, GET/PUT/DELETE `/users/:id` |
| Crops, Orders, Buyers, Tasks, Expenses, Inventory, Workers, Attendance, Equipment, Maintenance | GET `/`, GET `/:id`, POST `/` (admin + manager), PUT `/:id` and DELETE `/:id` (admin only) |
| Activity | GET `/activity`, DELETE `/activity/:id` (admin) |

Buyers use `multipart/form-data` with a `photo` file.

## Project structure
```
agri-management-system/
  backend/    config, models, controllers, routes, middleware, utils, seed.js, app.js
  frontend/   src/app/redux (axios setup, API, slices), src/components, src/pages, src/hooks
```

## Screenshots
Add screenshots here (login, dashboard, a CRUD page, buyer with photo).
