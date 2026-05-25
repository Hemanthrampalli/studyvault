# 🎓 StudyVault

> A full-stack BTech student resource portal where students can upload and access study materials organized by department, year, semester, and subject.

![StudyVault Banner](https://img.shields.io/badge/StudyVault-BTech%20Resource%20Portal-teal?style=for-the-badge&logo=graduation-cap)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## 📖 About

StudyVault is a collaborative study material sharing platform built for BTech students. Students can upload notes, previous year question papers, lab manuals, slides, and reference materials — all organized by department, year, semester, and subject.

Built as a learning project to understand full-stack web development from scratch.

---

## ✨ Features

### Phase 1 — Student Portal (Current)
- 🔐 **Authentication** — Register and login with email & password
- 🏛️ **8 Departments** — CSE, ECE, EEE, MECH, CIVIL, IT, CHEM, AIML
- 📚 **Browse Materials** — Navigate Department → Year → Semester → Subject
- ⬆️ **Upload Materials** — PDF, PPT, DOC, ZIP (up to 50MB)
- 🏷️ **Material Types** — Notes, PYQs, Lab Manuals, Slides, Reference
- 🔍 **Search & Filter** — Search by name, filter by material type
- ⬇️ **Download Tracking** — Download counter per material
- 👤 **Profile Page** — View your uploads and account info

### Phase 2 — Teacher Portal (Coming Soon)
- 📝 Assignment creation with deadlines
- 📤 Student submission system
- ✅ Grading and feedback
- 📢 Subject-wise announcements

### Phase 3 — Admin Panel (Planned)
- 👥 User management
- 📊 Analytics dashboard
- 🛡️ Content moderation

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS | Utility-first styling |
| Routing | React Router v6 | Page navigation |
| HTTP Client | Axios | API calls |
| Backend | Node.js + Express | REST API server |
| Database | PostgreSQL (Supabase) | Data storage |
| Auth | Supabase Auth | User authentication |
| File Storage | Supabase Storage | File uploads |
| Deployment | Vercel + Render | Frontend + Backend hosting |

---

## 📁 Project Structure

```
studyvault/
│
├── backend/
│   ├── routes/
│   │   ├── auth.js           # Register, login, profile
│   │   ├── departments.js    # List all departments
│   │   ├── subjects.js       # Filter subjects by dept/year/sem
│   │   └── materials.js      # Upload, list, download tracking
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── supabase.js           # Supabase client connection
│   ├── server.js             # Express app entry point
│   ├── .env                  # Environment variables (not in git)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx          # Landing page
    │   │   ├── Login.jsx         # Login form
    │   │   ├── Register.jsx      # Registration form
    │   │   ├── Browse.jsx        # Dept → Year → Sem → Subject
    │   │   ├── Subject.jsx       # Materials list + upload
    │   │   └── Profile.jsx       # User profile
    │   ├── components/
    │   │   ├── Navbar.jsx        # Top navigation bar
    │   │   ├── MaterialCard.jsx  # Single material card
    │   │   ├── UploadModal.jsx   # File upload popup
    │   │   └── ProtectedRoute.jsx # Auth guard
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── api.js                # All API call functions
    │   ├── App.jsx               # Routes definition
    │   └── main.jsx              # React entry point
    ├── .env                      # Frontend env variables (not in git)
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

```bash
node --version   # v18 or higher
npm --version    # v9 or higher
git --version    # any recent version
```

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/studyvault.git
cd studyvault
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project named `studyvault`
3. Go to **SQL Editor** and run the database schema (see [Database Schema](#database-schema))
4. Go to **Storage** → create a bucket named `materials` (set as Public)
5. Save your **Project URL**, **anon key**, and **service_role key**

### 3. Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

Start the backend:

```bash
npm run dev
```

Visit `http://localhost:5000` — you should see:
```json
{ "message": "🎓 StudyVault API is running!", "status": "healthy" }
```

### 4. Set Up Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Start the frontend:

```bash
npm run dev
```

Visit `http://localhost:5173` — the app should be running!

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (full access) |
| `SUPABASE_ANON_KEY` | Supabase anon public key |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

> ⚠️ Never commit `.env` files to Git. They are already in `.gitignore`.

---

## 🗄️ Database Schema

Run these SQL queries in Supabase SQL Editor to set up the database:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Departments
create table departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique,
  description text,
  created_at timestamp default now()
);

-- Subjects
create table subjects (
  id uuid default uuid_generate_v4() primary key,
  department_id uuid references departments(id) on delete cascade,
  name text not null,
  code text,
  year integer not null check (year between 1 and 4),
  semester integer not null check (semester between 1 and 8),
  created_at timestamp default now()
);

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text,
  role text default 'student' check (role in ('student', 'teacher', 'admin')),
  department_id uuid references departments(id),
  year integer check (year between 1 and 4),
  roll_number text,
  avatar_url text,
  created_at timestamp default now()
);

-- Materials
create table materials (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references subjects(id) on delete cascade,
  uploader_id uuid references profiles(id) on delete set null,
  uploader_name text,
  title text not null,
  description text,
  file_url text not null,
  file_path text not null,
  file_size bigint,
  file_type text,
  material_type text check (material_type in ('notes','pyq','lab','slides','reference')),
  downloads integer default 0,
  is_approved boolean default true,
  created_at timestamp default now()
);

-- Download History
create table download_history (
  id uuid default uuid_generate_v4() primary key,
  material_id uuid references materials(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  downloaded_at timestamp default now()
);
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/profile` | Get logged in user profile | Yes |

### Departments
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/departments` | List all departments | No |

### Subjects
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/subjects?department_id=&year=&semester=` | Filter subjects | No |

### Materials
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/materials?subject_id=` | List materials for subject | No |
| POST | `/api/materials/upload` | Upload new material | Yes |
| PATCH | `/api/materials/:id/download` | Track download | Yes |

---

## 🗺️ Roadmap

- [x] User authentication (register/login)
- [x] Department, year, semester, subject navigation
- [x] File upload to Supabase Storage
- [x] Material download with tracking
- [x] Search and filter materials
- [ ] My uploads on profile page
- [ ] Admin subject management
- [ ] Teacher portal — assignments
- [ ] Teacher portal — grading
- [ ] Teacher portal — announcements
- [ ] Email notifications
- [ ] Mobile responsive improvements

---

## 🤝 Contributing

This is a student project — contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Hemanth Rampalli**
- GitHub: [@Hemanthrampalli](https://github.com/Hemanthrampalli)

---

> Built with ❤️ for BTech students. Study smart, score higher! 🎓
