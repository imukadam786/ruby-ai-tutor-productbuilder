-- Migration 009: Add parent_email to users table

alter table public.users
  add column if not exists parent_email text;
