# Shergud (ሽር ጉድ) Developer & Agent Guidelines

## Overview
Shergud is an Ethiopian wedding vendor marketplace built with React 19, Vite, TanStack Router / TanStack Start, Tailwind CSS, and Supabase.

## Database & Backend
- Supabase provides PostgreSQL, Authentication, Row Level Security (RLS), and Storage.
- Database schemas, RLS policies, and seed scripts are located in `supabase/schema.sql`.

## Scripts
- `npm run dev`: Start local Vite development server
- `npm run build`: Compile full SSR + client production bundle
- `npm run preview`: Preview production build locally
