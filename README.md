# Project Camp Backend

A RESTful backend API for a collaborative project management platform built with **Node.js, Express.js, MongoDB, and Mongoose**.

Project Camp provides APIs for user authentication, project management, team member management, tasks, subtasks, project notes, file attachments, and role-based access control.

---

## Overview

Project Camp is a backend-focused project designed around collaborative project management.

The application allows users to:

- Create and manage projects
- Add and manage project members
- Assign roles within projects
- Create and manage tasks
- Break tasks into subtasks
- Track task and subtask progress
- Add project notes
- Attach files to tasks
- Authenticate using JWT-based authentication
- Verify email addresses
- Reset forgotten passwords
- Control access using role-based authorization

The backend follows a modular Express.js architecture, separating routes, controllers, middleware, models, validators, database configuration, and utility functions.

---

## Tech Stack

### Backend

- **Node.js**
- **Express.js 5**
- **MongoDB**
- **Mongoose**

### Authentication & Security

- **JSON Web Tokens (JWT)**
- **bcrypt**
- **crypto**
- **cookie-parser**
- **CORS**
- **express-validator**

### Email

- **Nodemailer**
- **Mailgen**

### File Uploads

- **Multer**

### Development Tools

- **Nodemon**
- **Prettier**
- **dotenv**

---

## Core Features

### Authentication

- User registration
- User login
- JWT access tokens
- JWT refresh tokens
- Logout
- Current authenticated user
- Password change
- Forgot-password workflow
- Password reset
- Email verification
- Resend email verification

### Project Management

- Create projects
- View accessible projects
- View project details
- Update projects
- Delete projects
- Manage project members
- Add members
- Remove members
- Update member roles

### Task Management

- Create tasks
- View project tasks
- View individual task details
- Update tasks
- Delete tasks
- Assign tasks to users
- Track task status
- Upload multiple task attachments

### Subtasks

- Create subtasks
- Update subtasks
- Mark subtasks as completed
- Delete subtasks
- Associate subtasks with parent tasks

### Project Notes

- Create project notes
- View project notes
- View individual notes
- Update notes
- Delete notes

### Other

- API health check
- Request validation
- Centralized API response/error utilities
- Email-based workflows
- File upload handling

---

# Architecture

The project follows a modular backend structure:

```text
Client
  │
  ▼
Express Application
  │
  ├── Routes
  │
  ▼
Middleware
  ├── Authentication
  ├── File Upload
  └── Validation
  │
  ▼
Controllers
  │
  ▼
Models / Mongoose
  │
  ▼
MongoDB
```

A typical request moves through the application approximately as:

```text
HTTP Request
     │
     ▼
    Route
     │
     ▼
 Middleware
     │
     ├── Authentication
     ├── Authorization
     └── Validation
     │
     ▼
 Controller
     │
     ▼
 Mongoose Model
     │
     ▼
 MongoDB
     │
     ▼
HTTP Response
```

---

# Project Structure

```text
project-root/
│
├── public/
│   └── images/
│       └── .gitkeep
│
├── src/
│   │
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   ├── healthcheck.controllers.js
│   │   ├── notes.controllers.js
│   │   ├── project.controllers.js
│   │   └── task.controllers.js
│   │
│   ├── db/
│   │   └── index.js
│   │
│   ├── middlewares/
│   │   ├── auth.middlewares.js
│   │   ├── multer.middlewares.js
│   │   └── validator.middlewares.js
│   │
│   ├── models/
│   │   ├── notes.models.js
│   │   ├── project.models.js
│   │   ├── projectmember.models.js
│   │   ├── subtask.models.js
│   │   ├── task.models.js
│   │   └── user.models.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── note.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   │
│   ├── utils/
│   │   ├── api-error.js
│   │   ├── api-response.js
│   │   ├── async-handler.js
│   │   ├── constants.js
│   │   └── mail.js
│   │
│   ├── validators/
│   │   └── index.js
│   │
│   ├── app.js
│   └── index.js
│
├── .env
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package.json
├── package-lock.json
└── PRD.md
```

> `node_modules/` and `.git/` are intentionally omitted from the project structure because they are not application source files.

### Folder Responsibilities

| Folder/File | Responsibility |
|---|---|
| `controllers/` | Contains the application/business logic for API requests |
| `db/` | Handles MongoDB database connection |
| `middlewares/` | Authentication, validation, and file-upload middleware |
| `models/` | Mongoose schemas and MongoDB models |
| `routes/` | Defines API endpoints and connects them to controllers/middleware |
| `utils/` | Reusable helpers such as API responses, errors, async handling, constants, and email |
| `validators/` | Request validation definitions |
| `public/images/` | Public storage location for uploaded files/images |
| `app.js` | Configures the Express application and middleware |
| `index.js` | Application entry point/server startup |

---

# Data Models

The application is centered around six main Mongoose models.

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Project      ProjectMember
 │
 ├───────────────┐
 │               │
 ▼               ▼
Task         ProjectNote
 │
 ▼
SubTask
```

## User

The `User` model handles authentication and account information.

It contains information such as:

- Username
- Email
- Full name
- Password
- Avatar
- Email verification status
- Refresh token
- Password reset token and expiry
- Email verification token and expiry
- Timestamps

Passwords are hashed before being stored using a Mongoose `pre("save")` hook and `bcrypt`.

The model also provides methods for:

- Checking whether a password is correct
- Generating access tokens
- Generating refresh tokens
- Generating temporary tokens

---

## Project

Represents a project/workspace.

```text
Project
├── name
├── description
├── createdBy
├── createdAt
└── updatedAt
```

---

## Project Member

Connects users to projects and stores their project-specific role.

```text
ProjectMember
├── user
├── project
├── role
├── createdAt
└── updatedAt
```

This model is important for implementing project-level authorization.

---

## Task

Represents a task belonging to a project.

```text
Task
├── title
├── description
├── project
├── assignedTo
├── assignedBy
├── status
├── attachments[]
├── createdAt
└── updatedAt
```

A task can contain multiple file attachments.

### Task Status

```text
todo
in_progress
done
```

---

## Subtask

Represents a smaller unit of work belonging to a task.

```text
SubTask
├── title
├── task
├── isCompleted
├── createdBy
├── createdAt
└── updatedAt
```

---

## Project Note

Stores notes associated with a project.

```text
ProjectNote
├── project
├── createdBy
├── content
├── createdAt
└── updatedAt
```

---

# Role-Based Access Control

The application uses three roles:

| Role | Description |
|---|---|
| `admin` | Full system/project administration |
| `project_admin` | Project-level task and subtask management |
| `member` | Basic project access and permitted task/subtask actions |

## Permission Matrix

| Feature | Admin | Project Admin | Member |
|---|:---:|:---:|:---:|
| Create Project | ✓ | ✗ | ✗ |
| Update Project | ✓ | ✗ | ✗ |
| Delete Project | ✓ | ✗ | ✗ |
| Manage Project Members | ✓ | ✗ | ✗ |
| Create Tasks | ✓ | ✓ | ✗ |
| Update Tasks | ✓ | ✓ | ✗ |
| Delete Tasks | ✓ | ✓ | ✗ |
| View Tasks | ✓ | ✓ | ✓ |
| Create Subtasks | ✓ | ✓ | ✗ |
| Update Subtask Status | ✓ | ✓ | ✓ |
| Delete Subtasks | ✓ | ✓ | ✗ |
| Create Notes | ✓ | ✗ | ✗ |
| Update Notes | ✓ | ✗ | ✗ |
| Delete Notes | ✓ | ✗ | ✗ |
| View Notes | ✓ | ✓ | ✓ |

---

# API Endpoints

All API routes are versioned under:

```text
/api/v1/
```

## Authentication

Base route:

```text
/api/v1/auth/
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Authenticate a user |
| `POST` | `/logout` | Logout the authenticated user |
| `GET` | `/current-user` | Get current user |
| `POST` | `/change-password` | Change password |
| `POST` | `/refresh-token` | Refresh access token |
| `GET` | `/verify-email/:verificationToken` | Verify email |
| `POST` | `/forgot-password` | Request password reset |
| `POST` | `/reset-password/:resetToken` | Reset password |
| `POST` | `/resend-email-verification` | Resend verification email |

---

## Projects

Base route:

```text
/api/v1/projects/
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List accessible projects |
| `POST` | `/` | Create project |
| `GET` | `/:projectId` | Get project details |
| `PUT` | `/:projectId` | Update project |
| `DELETE` | `/:projectId` | Delete project |
| `GET` | `/:projectId/members` | List project members |
| `POST` | `/:projectId/members` | Add project member |
| `PUT` | `/:projectId/members/:userId` | Update member role |
| `DELETE` | `/:projectId/members/:userId` | Remove project member |

---

## Tasks & Subtasks

Base route:

```text
/api/v1/tasks/
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:projectId` | List project tasks |
| `POST` | `/:projectId` | Create task |
| `GET` | `/:projectId/t/:taskId` | Get task details |
| `PUT` | `/:projectId/t/:taskId` | Update task |
| `DELETE` | `/:projectId/t/:taskId` | Delete task |
| `POST` | `/:projectId/t/:taskId/subtasks` | Create subtask |
| `PUT` | `/:projectId/st/:subTaskId` | Update subtask |
| `DELETE` | `/:projectId/st/:subTaskId` | Delete subtask |

---

## Notes

Base route:

```text
/api/v1/notes/
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:projectId` | List project notes |
| `POST` | `/:projectId` | Create project note |
| `GET` | `/:projectId/n/:noteId` | Get note details |
| `PUT` | `/:projectId/n/:noteId` | Update note |
| `DELETE` | `/:projectId/n/:noteId` | Delete note |

---

## Health Check

```text
GET /api/v1/healthcheck/
```

Returns the current API health/status response.

---

# Authentication Flow

The authentication system uses JWT access and refresh tokens.

```text
Register
   │
   ▼
Email Verification
   │
   ▼
Login
   │
   ├──► Access Token
   │
   └──► Refresh Token
             │
             ▼
      Refresh Access Token
```

For protected requests:

```text
Client
  │
  ▼
Access Token
  │
  ▼
Authentication Middleware
  │
  ▼
Authorization / Role Check
  │
  ▼
Controller
  │
  ▼
Response
```

Passwords are hashed with `bcrypt` before being persisted.

Temporary tokens for email verification and password reset are generated using Node.js's `crypto` module.

---

# File Uploads

Tasks support multiple file attachments.

Multer is used to process file uploads.

Attachment metadata includes:

```text
URL
MIME type
File size
```

The project provides a public image directory:

```text
public/images/
```

A `.gitkeep` file is used so the directory can remain tracked even when it contains no uploaded files.

---

# Validation & Middleware

The project separates cross-cutting request logic into middleware.

### Authentication Middleware

`auth.middlewares.js`

Responsible for authentication-related request processing and protecting secured routes.

### Multer Middleware

`multer.middlewares.js`

Handles incoming file uploads.

### Validator Middleware

`validator.middlewares.js`

Handles request validation before requests reach their controllers.

---

# Utilities

The `utils/` directory contains reusable backend helpers:

| File | Purpose |
|---|---|
| `api-error.js` | Custom API error handling |
| `api-response.js` | Standardized API responses |
| `async-handler.js` | Async controller/error handling |
| `constants.js` | Application constants and enums |
| `mail.js` | Email-related functionality |

Keeping these utilities separate helps avoid duplicating common logic across controllers.

---

# Security

The project implements several security mechanisms:

- JWT-based authentication
- Access and refresh tokens
- Password hashing with bcrypt
- Role-based authorization
- Request validation
- Email verification
- Password reset tokens
- CORS configuration
- Environment-based secrets
- File upload handling
- Protected API routes

---

# Getting Started

## Prerequisites

Make sure you have:

- Node.js
- npm
- MongoDB
- Git

installed on your system.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/knowmadhav/basecampy-project-management-platform.git
```

Navigate into the project:

```bash
cd basecampy-project-management-platform
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root of the project.

Example:

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=your_access_token_expiry

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password

CORS_ORIGIN=http://localhost:3000
```

The exact variables should match the configuration used by your application.

**Never commit real secrets or credentials to Git.**

---

# Running the Project

## Development

Start the development server using Nodemon:

```bash
npm run dev
```

## Production

Start the application normally:

```bash
npm start
```

The server will run on the port configured in your environment variables.

---

# NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `nodemon src/index.js` | Development server with automatic restart |
| `start` | `node src/index.js` | Start the application |

---

# What I Learned / Concepts Covered

This project was built to practice and understand backend development concepts including:

- REST API design
- Express.js
- MongoDB
- Mongoose
- Schema design
- MongoDB relationships using ObjectId references
- JWT authentication
- Access and refresh tokens
- Role-based access control
- Express middleware
- Request validation
- Password hashing
- Mongoose pre-save hooks
- Temporary token generation
- Email verification
- Password reset workflows
- File uploads with Multer
- Modular backend architecture
- Error handling
- API response standardization
- Environment variables
- Email delivery with Nodemailer

---

# Future Improvements

Possible future improvements include:

- Swagger/OpenAPI API documentation
- Unit and integration testing
- API rate limiting
- Pagination and filtering
- Search functionality
- Activity/audit logs
- Real-time task updates
- Cloud-based file storage
- Docker support
- CI/CD pipeline
- Production deployment
- Automated API testing

---

# Project Status

**Version:** `1.0.0`

The project currently contains the core backend functionality for authentication, projects, project members, tasks, subtasks, notes, file uploads, and role-based access control.

---

# Author

**Madhav Agarwal**

A backend project built while learning and applying **Node.js, Express.js, MongoDB, Mongoose, authentication, middleware, and REST API development**.

---

## License

This project is licensed under the **ISC License**.
