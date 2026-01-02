# Employee Management System

Sistem PT Nusantara Digital dengan fitur CRUD dan CSV import.

## Tech Stack

- **Backend:** NestJS + MySQL + Redis
- **Frontend:** Next.js + TypeScript

## Prerequisites

- Node.js >= 18.x
- MySQL >= 8.x
- Redis >= 6.x

## Installation

### 1. Install Dependencies

**Backend:**
```bash
cd employee-api
npm install
```

**Frontend:**
```bash
cd employee-fe
npm install
```

### 2. Setup Database

```sql
CREATE DATABASE db_employee;
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd employee-api
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=db_employee

JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**Frontend (.env):**
```bash
cd employee-fe
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

### 4. Run Seeder (Create Default User)

```bash
cd employee-api
npx ts-node src/database/seeds/user.seed.ts
```

## Running Application

### Start Redis
```bash
redis-server
# atau
brew services start redis  # macOS
```

### Start Backend (Terminal 1)
```bash
cd employee-api
npm run start:dev
```
Running on: **http://localhost:4001**

### Start Frontend (Terminal 2)
```bash
cd employee-fe
npm run dev
```
Running on: **http://localhost:4002**

## Running Tests

### Backend Tests
```bash
cd employee-api

# Run all tests
npm run test

# Run tests with coverage
npm run test:cov
```

## Access

- **Frontend:** http://localhost:4002
- **API:** http://localhost:4001/api
- **Swagger Docs:** http://localhost:4001/api/docs

## Default Login

Login dengan user dari seeder:
- Username: admin@mail.com
- Password: Admin123@

