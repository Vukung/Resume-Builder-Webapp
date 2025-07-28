```markdown
[Live Demo](https://resume-rocket-frontend.onrender.com)

# Resume Rocket — Full-Stack Resume Builder

Resume Rocket is a **React + Node.js** web application that lets users design, edit, and manage professional résumés in the browser.  
The project was built to demonstrate a modern MERN-style workflow (React & Node) using a **PostgreSQL** database hosted on **Supabase** and deployed end-to-end on **Render**’s free tier.

---

## ✨ Key Features
- **Account management**  
  Secure JWT-based signup / login with hashed passwords (bcrypt).

- **Dashboard**  
  • List, search, duplicate and delete résumés  
  • Animated page transitions and keyboard-friendly navigation

- **Resume Editor**  
  • Rich form sections for About, Education, Experience, Projects & Certifications  
  • Bulk clear + section-wise add / edit / delete  
  • Auto-formatting of dates and grade types

- **Notifications**  
  Toast-style success / error messages with smooth slide-in animation.

- **IPv4-forced DB pooler**  
  Production uses Supabase’s pooler URI to avoid IPv6 connectivity issues on Render.

---

## 🖼️ UI / UX Highlights

- Consistent **glass-morphism** cards on dark background  
- Gradient iconography for brand consistency  
- Focus & hover states for all interactive elements  
- PageTransition component for route-level fade / slide animations

---

## 🗂️ Project Structure
```
Resume-Builder-Webapp/
├── backend/          # Express API (+ db pool, routes, middleware)
│   ├── db/…
│   └── routes/…
├── frontend/         # React SPA 
│   ├── src/components
│   ├── src/hooks
│   └── src/styles
└── docs/             # README assets, schema diagrams, screenshots
```

---

## ⚙️ Technology Stack
| Layer          | Tech                                              |
|----------------|---------------------------------------------------|
| Frontend       | React 18, React Router 6, Tailwind CSS, Lucide Icons |
| Backend        | Node 20, Express 5, `pg` driver                   |
| Database       | PostgreSQL 15 on Supabase (free tier)             |
| Auth & Security| JWT, bcrypt, CORS                                 |
| CI / Deployment| Render (Web Service + Static Site)                |

---

## 🛠️ Local Development

### Prerequisites
- Node ≥ 20
- npm ≥ 9
- PostgreSQL (or free Supabase project)

### 1 · Clone
```
git clone https://github.com/Vukung/Resume-Builder-Webapp.git
git checkout Deployed
cd Resume-Builder-Webapp
```

### 2 · Environment Variables

`backend/.env`
```
PORT=5000
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### 3 · Install & Start
```
# backend
cd backend
npm install
npm run dev        # nodemon on :5000

# frontend (new terminal)
cd ../frontend
npm install
npm start          # CRA on :3000
```

---

## 📑 API Overview

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| POST   | `/api/auth/signup`               | Register                       |
| POST   | `/api/auth/login`                | Authenticate & get token       |
| GET    | `/api/resume/:userId`            | List user résumés              |
| POST   | `/api/resume/create`             | Create résumé                  |
| POST   | `/api/resume/duplicate/:id`      | Duplicate résumé               |
| POST   | `/api/resume/delete/:id`         | Soft-delete résumé             |
| GET    | `/api/resume/data/:resumeId`     | Full résumé (all sections)     |
| POST   | `/api/form/about` … `/education` | Section CRUD endpoints         |

(Authenticated routes require `Authorization: Bearer `)

---

## 🚀 Deploying to Render

```
# Web Service (backend)
Root Dir: backend
Build Cmd: npm install
Start Cmd: npm start
Env Vars : DATABASE_URL, JWT_SECRET, PORT=10000

# Static Site (frontend)
Root Dir: frontend
Build Cmd: npm install && npm run build
Publish  : build
```

Supabase → Settings → Database → “Use connection pooling” → copy **pooler URI** into `DATABASE_URL` (forces IPv4).

---

## © License
MIT

---

## 🙌 Acknowledgements
- **Supabase** team for the free “Database + Auth + Storage” tier  
- **Render** for hassle-free hobby deployments  
```
