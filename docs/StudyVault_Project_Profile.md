# StudyVault Project Profile and Promotion Kit

Prepared for: College presentation, project exposure, and social media promotion
Prepared on: May 27, 2026
Author: Hemanth Rampalli
Repository folder: studyvault

## One Line Pitch

StudyVault is a full-stack academic resource portal for BTech students where notes, previous year questions, lab manuals, slides, images, and reference files can be uploaded, searched, browsed, and downloaded by department, year, semester, and subject.

## Executive Summary

StudyVault solves a common student problem: important study material is usually scattered across WhatsApp groups, personal drives, classroom messages, and seniors' folders. The platform brings these resources into one organized portal. Students can register, log in, upload useful academic files, browse materials by academic structure, search the collection, and track downloads.

The project is built as a practical full-stack web application using React, Vite, Tailwind CSS, Node.js, Express, Supabase PostgreSQL, Supabase Auth, and Supabase Storage. It demonstrates frontend development, backend API design, authentication, file upload handling, database modeling, protected routes, and deployment-ready configuration.

## Why This Project Matters

- Students save time because resources are organized by department, year, semester, and subject.
- Juniors can learn from seniors by accessing shared notes and previous year papers.
- Faculty and student clubs can promote a stronger sharing culture.
- The college gains a reusable academic resource hub that can grow over time.
- The project demonstrates real-world web development skills beyond a basic static website.

## Target Users

- BTech students looking for notes, question papers, lab manuals, slides, and references.
- Student contributors who want to upload helpful academic resources.
- Faculty mentors who want a structured way to recommend resources.
- Department clubs and technical communities that want to preserve learning material.
- Future administrators who may moderate content and manage subjects.

## Current Features

- Email and password registration and login.
- Protected dashboard for logged-in students.
- One-hour inactivity session management that automatically logs users out after idle time.
- Browse flow by Department -> Year -> Semester -> Subject.
- Latest uploaded materials shown on the Browse page.
- Search for uploaded materials by title, description, and stored file path.
- Subject pages that list approved uploaded resources.
- File upload support for PDF, PPT, PPTX, DOC, DOCX, ZIP, JPG, JPEG, and PNG.
- Upload size limit of 50 MB.
- Material categories: notes, lecture note, previous questions, lab, slides, reference, and dataset.
- Material detail page with metadata and preview/download actions.
- Download tracking with a downloads counter.
- Dashboard statistics for uploads, downloads, materials, and subjects.
- Profile page with user details, settings, and uploaded materials.
- Anonymous upload option.
- Supabase Storage bucket for uploaded academic files.

## Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, Vite 8 | User interface and development server |
| Styling | Tailwind CSS | Responsive academic UI design |
| Routing | React Router 7 | Client-side navigation |
| API Client | Axios | HTTP requests from frontend to backend |
| Backend | Node.js, Express 5 | REST API server |
| Upload Handling | Multer | Multipart file upload processing |
| Database | Supabase PostgreSQL | Persistent project data |
| Authentication | Supabase Auth plus backend middleware | User registration, login, and profile access |
| File Storage | Supabase Storage | Academic material storage |
| Build Tools | ESLint, Vite build | Code quality and production build |

## Deployment Overview

StudyVault is designed as a cloud-ready full-stack application. The frontend, backend, database, authentication, and file storage can be deployed as separate managed services so the project is easier to maintain, scale, and present publicly.

Recommended deployment setup:

| Part | Recommended Platform | Reason |
|---|---|---|
| Frontend | Vercel | Fast React/Vite deployment, automatic builds from GitHub, HTTPS by default |
| Backend API | Render | Simple Node.js/Express hosting with environment variable support |
| Database | Supabase PostgreSQL | Managed relational database with dashboard and SQL editor |
| Authentication | Supabase Auth | Managed email/password authentication |
| File Storage | Supabase Storage | Public bucket for approved academic materials |
| Source Control | GitHub | Version control, collaboration, and automatic deployment triggers |

Deployment architecture:

1. User opens the public frontend URL hosted on Vercel.
2. React frontend sends API requests to the Render backend URL.
3. Express backend validates authentication and business logic.
4. Backend reads/writes data in Supabase PostgreSQL.
5. Uploaded files are stored in Supabase Storage under the `materials` bucket.
6. Public file URLs are saved in the `materials` table and displayed in the app.

## Deployment Configuration

Frontend environment variables:

| Variable | Example | Purpose |
|---|---|---|
| VITE_API_URL | https://studyvault-api.onrender.com | Public backend API URL used by Axios |
| VITE_SUPABASE_URL | https://your-project.supabase.co | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | your-anon-key | Public Supabase anon key |

Backend environment variables:

| Variable | Example | Purpose |
|---|---|---|
| PORT | 5000 | Backend server port |
| SUPABASE_URL | https://your-project.supabase.co | Supabase project URL |
| SUPABASE_SERVICE_KEY | your-service-role-key | Private backend-only Supabase service key |
| SUPABASE_SERVICE_ROLE_KEY | your-service-role-key | Alternate supported service key name |
| SUPABASE_ANON_KEY | your-anon-key | Supabase anon key, useful for client-compatible operations |

Important deployment notes:

- The Supabase service role key must never be exposed in frontend code.
- Vercel should only receive public frontend environment variables.
- Render should receive backend secrets through its environment variable dashboard.
- The backend CORS list must include the deployed frontend URL.
- Supabase Storage bucket `materials` should be public if files are opened directly by users.
- The database schema should be applied in Supabase SQL Editor before deploying the app.

## Deployment Steps

1. Push the complete project to a GitHub repository.
2. Create a Supabase project and run `backend/supabase-schema.sql` in the SQL Editor.
3. Confirm that the `materials` storage bucket exists and supports allowed file types.
4. Deploy the backend folder to Render as a Node.js web service.
5. Add backend environment variables in Render.
6. Test the backend health route: `/`.
7. Deploy the frontend folder to Vercel as a Vite project.
8. Add frontend environment variables in Vercel.
9. Update backend CORS settings with the final Vercel frontend URL.
10. Test registration, login, browsing, upload, download, profile, and inactivity logout.

## Deployment Benefits for Presentation

- Shows that StudyVault is not only a local project; it can be publicly accessed and demonstrated.
- Proves practical knowledge of production configuration and environment variables.
- Demonstrates separation of frontend, backend, database, auth, and storage services.
- Makes it easier to share the app with classmates, faculty, department clubs, and social media audiences.
- Allows QR code promotion on posters, classrooms, and college notice boards.
- Supports future scaling because services can be improved independently.

## Application Modules

| Module | Main Files | Purpose |
|---|---|---|
| Authentication | backend/routes/auth.js, frontend/src/context/AuthContext.jsx | Register, login, profile, session state, inactivity logout |
| Dashboard | backend/routes/dashboard.js, frontend/src/pages/Dashboard.jsx | Stats, recent materials, user overview |
| Browse | backend/routes/departments.js, backend/routes/subjects.js, frontend/src/pages/Browse.jsx | Academic navigation and search |
| Materials | backend/routes/materials.js, frontend/src/pages/Subject.jsx, frontend/src/pages/MaterialDetail.jsx | Upload, list, detail, download tracking |
| Profile | frontend/src/pages/Profile.jsx | User profile, settings, and uploaded resources |
| API Client | frontend/src/api.js | Central frontend API functions |
| UI Shell | frontend/src/components/AppShell.jsx, ProtectedRoute.jsx, MaterialCard.jsx | Layout, auth guard, reusable material cards |

## Database Design

| Table | Purpose | Important Fields |
|---|---|---|
| departments | Stores branches/departments | id, name, code |
| subjects | Stores subjects under departments | id, department_id, name, code, year, semester |
| profiles | Stores student profile data | id, email, name, department_id, year, roll_number, role, settings |
| materials | Stores uploaded resource metadata | id, subject_id, uploader_id, title, description, material_type, file_url, file_path, file_size, file_type, downloads, views, rating, is_approved |
| download_history | Stores download records | id, material_id, user_id, created_at |
| storage bucket: materials | Stores actual uploaded files | public bucket, 50 MB limit, allowed MIME types |

## Seeded Academic Data

Departments currently seeded:

- Computer Science Engineering (CSE)
- Electrical and Electronics Engineering (EEE)
- Mechanical Engineering (ME)
- Civil Engineering (CE)
- Electronics and Communication Engineering (ECE)
- Information Technology (IT)

Sample subjects currently seeded:

- Programming for Problem Solving (CS101), Year 1, Semester 1
- Data Structures (CS201), Year 2, Semester 3
- Database Management Systems (CS301), Year 3, Semester 5
- Machine Learning (CS402), Year 4, Semester 7
- Basic Electrical Engineering (EE101), Year 1, Semester 1
- Engineering Mechanics (ME101), Year 1, Semester 1
- Surveying (CE201), Year 2, Semester 3
- Digital Electronics (EC201), Year 2, Semester 3
- Web Technologies (IT301), Year 3, Semester 5

## API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| POST | /api/auth/register | Create a new student account | No |
| POST | /api/auth/login | Log in and receive token | No |
| GET | /api/auth/profile | Load logged-in profile | Yes |
| PATCH | /api/auth/profile | Update profile/settings | Yes |
| GET | /api/dashboard | Load dashboard stats and recent uploads | Yes |
| GET | /api/departments | List all departments | No |
| GET | /api/subjects | Filter subjects by department, year, semester | No |
| GET | /api/subjects/:id | Load one subject | No |
| GET | /api/materials | List/search approved materials | No |
| GET | /api/materials/my-uploads | List user's uploaded materials | Yes |
| POST | /api/materials/upload | Upload a new material | Yes |
| GET | /api/materials/:id | Load one material detail | No |
| PATCH | /api/materials/:id/download | Track a material download | Yes |

## Student Workflow

1. Student creates an account or logs in.
2. Student opens the dashboard to see activity and recent resources.
3. Student browses by department, year, semester, and subject.
4. Student searches for a material title, subject, or department.
5. Student opens a material detail page.
6. Student downloads the resource.
7. Student uploads useful notes, question papers, slides, or lab files.
8. Student can view their uploads and profile details.
9. If the student is inactive for one hour, the session is automatically logged out.

## Security and Quality Notes

- Environment secrets are stored in .env files and are not committed.
- Supabase service key is used only from the backend.
- Protected routes prevent unauthenticated access to dashboard, upload, and profile pages.
- Backend auth middleware verifies authenticated requests.
- Inactivity session management reduces risk on shared college systems.
- Multer validates file size and allowed MIME types before upload.
- Supabase RLS policies allow public reading of approved materials while protecting profile access.
- Frontend lint and production build currently pass.
- Production deployment separates public frontend variables from private backend secrets.
- HTTPS hosting through Vercel, Render, and Supabase improves trust when sharing the app publicly.

## College Presentation Talking Points

- StudyVault directly addresses academic resource fragmentation.
- It can become a department-level digital resource bank.
- The app encourages peer-to-peer learning and senior-junior collaboration.
- It is practical, scalable, and built with modern full-stack tools.
- It demonstrates real engineering skills: authentication, REST APIs, database schema, file uploads, cloud storage, UI design, and session management.
- The system can be extended for teacher assignments, announcements, moderation, analytics, and notifications.

## Demo Script

1. Open the StudyVault app and introduce the problem.
2. Register or log in as a student.
3. Show the dashboard stats and recent community uploads.
4. Open Browse Materials and show latest uploaded files.
5. Navigate Department -> Year -> Semester -> Subject.
6. Search for a material by title or subject.
7. Open a material detail page and show metadata.
8. Upload a sample PDF or image with title, type, and description.
9. Return to Browse or Subject page and show the uploaded file.
10. Show the deployed frontend and backend URLs to prove the app is publicly accessible.
11. Explain session timeout, download tracking, deployment setup, and the future roadmap.

## Future Roadmap

- Teacher portal for assignments, submissions, grading, feedback, and announcements.
- Admin panel for content moderation and subject management.
- College-specific deployment with official branding.
- Custom college domain and QR-code-based launch poster.
- More departments, electives, and semester subjects.
- Email notifications for new materials and announcements.
- Better preview support for PDFs and documents.
- Analytics for popular subjects and most downloaded resources.
- Role-based access for students, teachers, and admins.
- Moderation queue before public approval.

## Value for College Exposure

StudyVault can be presented as a student-built academic utility rather than only a coding project. It helps the college show innovation, peer learning, and digital transformation. It is easy to explain to students because the problem is familiar: everyone needs notes and previous question papers, but nobody wants to search through scattered chats and folders.

## Social Media Positioning

Primary message:

StudyVault is a student-built portal that organizes BTech study materials by department, year, semester, and subject, making academic resources easier to find and share.

Audience:

- Students
- Faculty
- Department clubs
- Training and placement groups
- College innovation cells
- Alumni who want to contribute resources

Tone:

- Helpful
- Student-friendly
- Practical
- Community-driven
- Proud but not exaggerated

## LinkedIn Post

Excited to share StudyVault, a full-stack academic resource portal built for BTech students.

StudyVault helps students upload, browse, search, and download study materials such as notes, previous year question papers, lab manuals, slides, images, and reference files. Resources are organized by department, year, semester, and subject, making it easier for students to find what they need at the right time.

Tech used: React, Vite, Tailwind CSS, Node.js, Express, Supabase PostgreSQL, Supabase Auth, and Supabase Storage.

Key features:
- Student authentication
- Department/year/semester/subject browsing
- File uploads up to 50 MB
- Search and filtering
- Download tracking
- Profile and dashboard
- One-hour inactivity session logout

This project is built to support student collaboration and make academic resources easier to access.

#StudyVault #FullStackDevelopment #ReactJS #NodeJS #Supabase #BTech #StudentProject #WebDevelopment #CollegeProject

## Instagram Caption

Meet StudyVault, a student-built academic resource portal for BTech students.

Upload notes, PYQs, lab manuals, slides, and references. Browse by department, year, semester, and subject. Search materials quickly and keep useful resources in one place.

Built with React, Node.js, Express, Tailwind CSS, and Supabase.

Study smart. Share better. Help your classmates.

#StudyVault #BTechLife #StudentProject #CollegeProject #EngineeringStudents #ReactJS #NodeJS #Supabase #StudyMaterials

## WhatsApp Announcement

Hi everyone,

I built StudyVault, a web app for BTech students to upload and access study materials in an organized way.

You can browse resources by department, year, semester, and subject. It supports notes, previous year questions, lab files, slides, documents, ZIP files, and images.

The goal is to reduce scattered study material and build a helpful student resource library for everyone.

Please try it, share useful resources, and give feedback.

## Poster Text

Title:
StudyVault

Subtitle:
One organized place for BTech study materials.

Body:
Upload and access notes, previous year questions, lab manuals, slides, and reference files. Browse by department, year, semester, and subject.

Highlights:
- Student login
- Organized subject-wise materials
- Search and filter resources
- Upload files up to 50 MB
- Track downloads
- Built for student collaboration

Call to action:
Share your notes. Help your classmates. Build a stronger learning community.

## 30 Second Elevator Pitch

StudyVault is a full-stack web application built for BTech students to solve the problem of scattered study materials. Instead of searching through different chats and folders, students can upload and find notes, previous year papers, lab manuals, slides, and references in one organized portal. The platform supports authentication, file uploads, department-wise browsing, search, download tracking, profile management, and one-hour inactivity logout. It is built with React, Node.js, Express, Supabase, and Tailwind CSS, and it can grow into a complete college resource hub.

## Faculty or Club Email

Subject: StudyVault - Student Academic Resource Portal

Dear Sir/Madam,

I am sharing StudyVault, a full-stack web application built to help BTech students access and share academic materials in an organized way.

The platform allows students to upload and browse notes, previous year question papers, lab manuals, slides, images, documents, and reference files. Materials are structured by department, year, semester, and subject, which makes them easier to find and reuse.

This project demonstrates practical full-stack development using React, Node.js, Express, Supabase PostgreSQL, Supabase Auth, Supabase Storage, and Tailwind CSS. It includes authentication, protected routes, file uploads, search, dashboard stats, download tracking, profile management, and inactivity logout.

I would be grateful for feedback and guidance on how this project can be improved or introduced to students for academic use.

Thank you.

Regards,
Hemanth Rampalli

## Suggested Launch Plan

1. Share the demo with classmates and collect feedback.
2. Ask 5 to 10 students to upload useful sample materials.
3. Present the project to a faculty mentor or department club.
4. Deploy the backend, frontend, and Supabase setup using production environment variables.
5. Test the public deployed link on mobile data and college Wi-Fi.
6. Post the LinkedIn and Instagram captions with screenshots and the live project link.
7. Create a QR code poster for classroom or department notice boards.
8. Add more subjects and department data.
9. Add moderation if many students start uploading.

## Data to Collect After Launch

- Number of registered users.
- Number of uploaded materials.
- Most active departments.
- Most searched subjects.
- Most downloaded materials.
- Feedback from students and faculty.
- File types most commonly uploaded.

## Final Project Statement

StudyVault is a practical, student-focused full-stack project that can be used as both a technical portfolio project and a real academic utility. It shows that software can solve everyday college problems when it is designed around actual student workflows.
