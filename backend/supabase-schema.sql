-- StudyVault Supabase setup
-- Run this in Supabase SQL Editor for the single project you are using locally/demo.

create extension if not exists "pgcrypto";

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  code text not null,
  year int not null check (year between 1 and 4),
  semester int not null check (semester between 1 and 8),
  created_at timestamptz not null default now(),
  unique (department_id, code, semester)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null,
  department_id uuid references public.departments(id) on delete set null,
  year int check (year between 1 and 4),
  roll_number text,
  role text not null default 'student',
  settings jsonb not null default '{
    "profile_visible": true,
    "show_academic_stats": true,
    "email_notifications": true,
    "direct_messages": true
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  uploader_id uuid references public.profiles(id) on delete set null,
  uploader_name text not null default 'Anonymous',
  title text not null,
  description text,
  material_type text not null check (material_type in ('notes', 'lecture_note', 'pyq', 'lab', 'slides', 'reference', 'dataset')),
  file_url text not null,
  file_path text not null,
  file_size bigint,
  file_type text,
  downloads int not null default 0,
  views int not null default 0,
  rating numeric(2,1) not null default 4.8,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.download_history (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at
before update on public.materials
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.increment_downloads(material_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  target_id alias for $1;
begin
  update public.materials
  set downloads = coalesce(downloads, 0) + 1
  where id = target_id;
end;
$$;

insert into public.departments (name, code) values
  ('Computer Science Engineering', 'CSE'),
  ('Electrical and Electronics Engineering', 'EEE'),
  ('Mechanical Engineering', 'ME'),
  ('Civil Engineering', 'CE'),
  ('Electronics and Communication Engineering', 'ECE'),
  ('Information Technology', 'IT')
on conflict (code) do update set name = excluded.name;

insert into public.subjects (department_id, name, code, year, semester)
select d.id, s.name, s.code, s.year, s.semester
from public.departments d
cross join (
  values
    ('CSE', 'Programming for Problem Solving', 'CS101', 1, 1),
    ('CSE', 'Data Structures', 'CS201', 2, 3),
    ('CSE', 'Database Management Systems', 'CS301', 3, 5),
    ('CSE', 'Machine Learning', 'CS402', 4, 7),
    ('EEE', 'Basic Electrical Engineering', 'EE101', 1, 1),
    ('ME', 'Engineering Mechanics', 'ME101', 1, 1),
    ('CE', 'Surveying', 'CE201', 2, 3),
    ('ECE', 'Digital Electronics', 'EC201', 2, 3),
    ('IT', 'Web Technologies', 'IT301', 3, 5)
) as s(dept_code, name, code, year, semester)
where d.code = s.dept_code
on conflict (department_id, code, semester) do update
set name = excluded.name,
    year = excluded.year;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materials',
  'materials',
  true,
  52428800,
  array[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.departments enable row level security;
alter table public.subjects enable row level security;
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.download_history enable row level security;

drop policy if exists "Departments are readable" on public.departments;
create policy "Departments are readable"
on public.departments for select
using (true);

drop policy if exists "Subjects are readable" on public.subjects;
create policy "Subjects are readable"
on public.subjects for select
using (true);

drop policy if exists "Approved materials are readable" on public.materials;
create policy "Approved materials are readable"
on public.materials for select
using (is_approved = true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
