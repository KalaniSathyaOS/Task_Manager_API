# Task Manager API

A Task Management REST API built with NestJS, Prisma, and PostgreSQL. It includes authentication, project management, and task management with filtering and sorting capabilities.

## Tech Stack
NestJS, PostgreSQL, Prisma ORM, JWT Authentication, Swagger

## Features
User Registration and Login
JWT Authentication
Project CRUD 
Task CRUD
Task filtering by status and priority
Basic sorting
Swagger API documentation

## Setup Instructions

1. Clone the repository:
git clone #project url
cd task-manager-api
2. Install dependencies: npm install
3. Create .env file: DATABASE_URL="postgresql://postgres:password@localhost:5432/task_manager" JWT_SECRET="supersecret"
4. Create database: CREATE DATABASE task_manager;
5. Run migrations: npx prisma migrate dev
6. Start the server: npm run start:dev

## Swagger URL
http://localhost:3000/api

## Authentication
All protected routes require: token

## API Endpoints

Auth:
POST /auth/register
POST /auth/login

Projects:
GET /projects
POST /projects
PATCH /projects/:id

Tasks:
GET /tasks
POST /tasks
PATCH /tasks/:id