# Employee API

RESTful API built with **NestJS**, **TypeORM**, and **MySQL** featuring JWT Authentication, Employee CRUD, Swagger documentation, and unit testing with coverage.

---

## Tech Stack
- Node.js
- NestJS
- TypeORM
- MySQL
- JWT
- Swagger (OpenAPI)
- Jest

---

## Installation

```bash
git clone https://github.com/anangnovriadi/test-nusantara-digital.git
cd employee-api
npm install
```

## Environment Configuration

Create database:
```bash
CREATE DATABASE db_employee;
```

Create .env file or copy from .env.example:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=db_employee

JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d
```

## Running the Application

```bash
npm run start:dev
```

## Database Seeding (User)

```bash
cd employee-api
npx ts-node src/database/seeds/user.seed.ts
```

## Swagger Documentation

```bash
http://localhost:3000/api/docs
```

## Running Unit Tests

Run all unit tests:
```bash
npm run test
```

Run coverage report:
```bash
npm run test:cov
```