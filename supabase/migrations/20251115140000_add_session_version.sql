alter table public.users
add column if not exists session_version integer default 1 not null;
