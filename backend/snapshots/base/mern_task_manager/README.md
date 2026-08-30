# MERN Task Manager

A full-stack task management application built with React, Node.js, Express, and Mongoose-style models.

Users can sign up, log in, manage tasks, search and sort them, and move tasks between columns using drag-and-drop.

## How the App Works

The application has two main parts:

- **Frontend** — React application responsible for the UI, user interaction, and client-side state.
- **Backend** — Express API responsible for authentication and task operations.

The frontend communicates with the backend through HTTP requests.


## Authentication

The application supports:

- Sign up
- Log in
- Log out

Authentication uses JWTs stored in HTTP-only cookies.

Protected routes require an authenticated user.

## Task Management

Tasks contain:

- Title
- Description
- Status (To Do, In Progress, Done)
- Priority (Low, Medium, High)
- Due date
- Assigned user

Tasks can be:

- Created
- Viewed
- Edited
- Deleted
- Searched
- Sorted
- Reordered


Dragging a task to another column changes its status through the application's task flow.

## Project Structure

### Backend

backend/
├── controllers/     # Request handlers and application logic
├── models/          # User and Task data models
├── routes/          # API route definitions
├── middlewares/     # Authentication and shared middleware
├── db/              # Database / data-store logic
├── utils/           # Shared backend utilities
├── server.js        # Main application entry point
├── .env             # Environment variables
└── package.json     # Backend dependencies

### Frontend

frontend/
├── src/
│   ├── assets/          # Static assets (images, etc.)
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application pages
│   ├── redux/           # Global application state
│   ├── utils/           # Task and drag-and-drop logic
│   ├── helper.js        # React Query helpers
│   ├── App.jsx          # Application routing
│   ├── main.jsx         # Frontend entry point
│   ├── App.css          # Application styles
│   └── index.css        # Global styles
├── public/              # Static public assets
├── .env                 # Environment variables
├── package.json         # Frontend dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration

## Frontend State

The frontend uses **Redux Toolkit** for application state such as authentication and tasks.

Some parts of the application use **React Query** for server-side data fetching and mutations.

When tracing a feature, check how the UI connects to its API and state-management layer.

## Backend Flow

A typical request follows this path:

Route
  ↓
Middleware
  ↓
Controller
  ↓
Model / Data Store
  ↓
Response

For authentication:

Login / Signup
      ↓
Auth route
      ↓
Auth controller
      ↓
User model
      ↓
JWT cookies

## Live Preview & Data Storage

When running the application in DevCode's Live Preview, the backend uses an in-memory data store to simulate the database. Data created during the preview session, such as accounts and tasks, is temporary and is not persisted to the production database or stored elsewhere.

You can use any dummy email and password to create an account in Live Preview. No real credentials are required.

## Development Environment

This repository runs inside the **WebContainer environment** used by DevCode.

The environment starts both the backend and frontend development servers.

When running inside WebContainer, the project uses its in-memory data-store behavior, so a separate MongoDB server is not required while solving a challenge.

## Solving a Challenge

1. Read this README to understand the overall project.
2. Read `challenge.md` to understand the specific challenge.
3. Locate the files mentioned by the challenge.
4. Trace how data flows through the relevant components, routes, controllers, helpers, or state.
5. Make the smallest change necessary to restore the required behavior.
6. Run the provided tests.

The repository contains working code outside the challenge area, so avoid changing unrelated functionality.

## Important

Challenges are designed around the existing application architecture.

When solving a challenge, preserve:

- API contracts
- Route structure
- Authentication flow
- State management
- Component structure
- Data models
- Unrelated application behavior

Focus on understanding the existing code before rewriting it.
