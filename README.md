# ProjectHub — Project Management SPA

A Single Page Application for managing internal company projects, built with Vanilla JavaScript and json-server.

---

## Description

ProjectHub allows two types of users (Manager and Collaborator) to manage projects. Managers have full CRUD access while collaborators can only view their assigned projects and update their status.

---

## Technologies

- HTML5
- CSS3 (custom, no frameworks)
- JavaScript (Vanilla, ES6+)
- [json-server](https://github.com/typicode/json-server) — simulated REST API

---

## Installation

```bash
# Install json-server globally
npm install -g json-server
```

No other installation required. This is plain HTML/CSS/JS.

---

## Running the Project

1. Start json-server:

```bash
json-server --watch db.json --port 3000
```

2. Open `index.html` in your browser.

> If you use VS Code, the Live Server extension works great.

---

## Running JSON Server

```bash
json-server --watch db.json --port 3000
```

The API will be available at `http://localhost:3000`

- `GET    /users`
- `GET    /projects`
- `POST   /projects`
- `PATCH  /projects/:id`
- `DELETE /projects/:id`

---

## Test Users

| Role         | Email             | Password |
|--------------|-------------------|----------|
| Manager      | manager@test.com  | 123456   |
| Collaborator | user@test.com     | 123456   |

---

## Project Structure

```
project-manager/
│
├── index.html              # Main HTML file (SPA shell)
├── db.json                 # json-server database
│
├── css/
│   └── styles.css          # All styles
│
└── js/
    ├── app.js              # Router, navbar, toast, modal, init
    ├── modules/
    │   ├── api.js          # All fetch calls to json-server
    │   ├── auth.js         # Login / logout logic
    │   └── session.js      # localStorage session helpers
    └── pages/
        ├── login.js        # Login form and validation
        ├── dashboard.js    # Dashboard stats
        └── projects.js     # Project list, CRUD, filters
```

---

## Role Permissions

| Action                     | Manager | Collaborator |
|----------------------------|---------|--------------|
| See all projects           | ✅      | ❌           |
| See assigned projects      | ✅      | ✅           |
| Create projects            | ✅      | ❌           |
| Edit projects              | ✅      | ❌           |
| Delete projects            | ✅      | ❌           |
| Update own project status  | ✅      | ✅           |
| View dashboard stats       | ✅      | ✅ (limited) |

---

## Technical Decisions

- **No frameworks**: Vanilla JS was chosen to keep the code understandable and match the junior level of the exercise.
- **SPA routing**: A simple `navigate(page)` function re-renders the `#app` div without page reloads.
- **Session persistence**: `localStorage` stores the logged-in user as JSON so the session survives page refreshes.
- **Modularization**: Code is split into small files by responsibility (api, auth, session, pages).
- **Guards**: `navigate()` checks for a valid session and redirects to login if none exists.
- **In-memory filtering**: Projects are stored in `allProjects` after fetching, and filtered locally to avoid extra API calls.
