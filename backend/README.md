# Agriculture Management System - Backend

Node.js + Express + PostgreSQL (Sequelize) + JWT. Roles: **admin** (full access) and **manager** (view + add).

## Setup
1. Install PostgreSQL (with pgAdmin) and create a database, e.g. `technodevs37`.
2. Copy `.env.example` to `.env` and fill in your values (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, JWT_SECRET, PORT_NAME=5000).
3. Install packages:
   ```
   npm install express cors helmet dotenv sequelize pg pg-hstore bcryptjs jsonwebtoken multer morgan express-rate-limit
   npm install --save-dev nodemon
   ```
4. `npm run test:db`  - must print "PostgreSQL connected successfully"
5. `npm run dev`      - starts the API on http://localhost:5000 and creates the tables
6. `npm run seed`     - creates demo users and sample data (run in a second terminal)

## Demo credentials
- Admin: `admin` / `Admin@123`
- Manager: `manager` / `Manager@123`

## API (all under /api)
Auth: POST /users/register, /users/login, /users/logout, /users/change-password, GET /users/me
Users (admin): GET/POST /users, GET/PUT/DELETE /users/:id
Crops, Orders, Buyers, Tasks, Expenses, Inventory, Workers, Attendance, Equipment, Maintenance:
GET /, GET /:id, POST / (admin + manager), PUT /:id and DELETE /:id (admin only).
Buyers use multipart/form-data with a `photo` file (JPG/PNG, max 1 MB).
Activity: GET /activity (all), DELETE /activity/:id (admin).

Responses: `{ succeeded, message, data }`; login returns `{ succeeded, message, user: { ..., token } }`.
