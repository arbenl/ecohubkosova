-- Migration: Rename all Albanian column names to English
-- This migration renames columns across all tables for consistency and international collaboration

-- =======================
-- TABLE: public.users
-- =======================
alter table public.users rename column emri_i_plote to full_name;
alter table public.users rename column vendndodhja to location;
alter table public.users rename column roli to role;
alter table public.users rename column eshte_aprovuar to is_approved;

-- Update check constraint for role
alter table public.users drop constraint if exists users_roli_check;
alter table public.users add constraint users_role_check 
  check (role in ('Individ', 'Admin'));

-- Update indexes
drop index if exists idx_users_roli;
create index idx_users_role on public.users(role);

-- =======================
-- TABLE: public.organizations
-- =======================
alter table public.organizations rename column emri to name;
alter table public.organizations rename column pershkrimi to description;
alter table public.organizations rename column interesi_primar to primary_interest;
alter table public.organizations rename column person_kontakti to contact_person;
alter table public.organizations rename column email_kontakti to contact_email;
alter table public.organizations rename column vendndodhja to location;
alter table public.organizations rename column lloji to type;
alter table public.organizations rename column eshte_aprovuar to is_approved;

-- Update check constraint for type
alter table public.organizations drop constraint if exists organizations_lloji_check;
alter table public.organizations add constraint organizations_type_check 
  check (type in ('OJQ', 'Ndërmarrje Sociale', 'Kompani'));

-- Update indexes
drop index if exists idx_organizations_approved;
drop index if exists idx_organizations_lloji;
create index idx_organizations_is_approved on public.organizations(is_approved);
create index idx_organizations_type on public.organizations(type);

-- =======================
-- TABLE: public.organization_members
-- =======================
alter table public.organization_members rename column roli_ne_organizate to role_in_organization;
alter table public.organization_members rename column eshte_aprovuar to is_approved;

-- =======================
-- TABLE: public.artikuj
-- =======================
alter table public.artikuj rename column titulli to title;
alter table public.artikuj rename column permbajtja to content;
alter table public.artikuj rename column autori_id to author_id;
alter table public.artikuj rename column eshte_publikuar to is_published;
alter table public.artikuj rename column kategori to category;
alter table public.artikuj rename column foto_kryesore to featured_image;

-- Update indexes
drop index if exists idx_artikuj_published;
drop index if exists idx_artikuj_kategori;
create index idx_artikuj_is_published on public.artikuj(is_published);
create index idx_artikuj_category on public.artikuj(category);

-- =======================
-- TABLE: public.tregu_listime
-- =======================
alter table public.tregu_listime rename column titulli to title;
alter table public.tregu_listime rename column pershkrimi to description;
alter table public.tregu_listime rename column kategori to category;
alter table public.tregu_listime rename column cmimi to price;
alter table public.tregu_listime rename column njesia to unit;
alter table public.tregu_listime rename column vendndodhja to location;
alter table public.tregu_listime rename column sasia to quantity;
alter table public.tregu_listime rename column lloji_listimit to listing_type;
alter table public.tregu_listime rename column eshte_aprovuar to is_approved;

-- Update check constraint for listing_type
alter table public.tregu_listime drop constraint if exists tregu_listime_lloji_listimit_check;
alter table public.tregu_listime add constraint tregu_listime_listing_type_check 
  check (listing_type in ('shes', 'blej'));

-- Update indexes
drop index if exists idx_tregu_approved;
drop index if exists idx_tregu_lloji;
drop index if exists idx_tregu_kategori;
create index idx_tregu_is_approved on public.tregu_listime(is_approved);
create index idx_tregu_listing_type on public.tregu_listime(listing_type);
create index idx_tregu_category on public.tregu_listime(category);

-- =======================
-- UPDATE RLS FUNCTIONS
-- =======================

-- Recreate is_admin function with new column name
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select true from public.users where id = uid and role = 'Admin'),
    false
  );
$$;

-- =======================
-- UPDATE RLS POLICIES
-- =======================

-- Users table policies
drop policy if exists "Users: read own or admin" on public.users;
drop policy if exists "Users: insert self" on public.users;
drop policy if exists "Users: update self" on public.users;

create policy "Users: read own or admin" on public.users
  for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Users: insert self" on public.users
  for insert
  with check (
    (auth.uid() = id and role = 'Individ')
    or public.is_admin(auth.uid())
  );

create policy "Users: update self" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'Individ');

-- Organizations table policies
drop policy if exists "Organizations: public view" on public.organizations;
drop policy if exists "Organizations: insert by authenticated" on public.organizations;

create policy "Organizations: public view" on public.organizations
  for select
  using (is_approved = true);

create policy "Organizations: insert by authenticated" on public.organizations
  for insert
  with check (auth.uid() is not null and coalesce(is_approved, false) = false);

-- Organization members policies
drop policy if exists "Org members: insert by member or admin" on public.organization_members;

create policy "Org members: insert by member or admin" on public.organization_members
  for insert
  with check (
    (user_id = auth.uid() and coalesce(is_approved, false) = false)
    or public.is_admin(auth.uid())
  );

-- Articles table policies
drop policy if exists "Artikuj: view published" on public.artikuj;

create policy "Artikuj: view published" on public.artikuj
  for select
  using (
    is_published = true
    or public.is_admin(auth.uid())
    or author_id = auth.uid()
  );

-- Listings table policies
drop policy if exists "Listings: view approved or owner" on public.tregu_listime;
drop policy if exists "Listings: insert by owner" on public.tregu_listime;

create policy "Listings: view approved or owner" on public.tregu_listime
  for select
  using (
    is_approved = true
    or created_by_user_id = auth.uid()
    or public.is_admin(auth.uid())
  );

create policy "Listings: insert by owner" on public.tregu_listime
  for insert
  with check (created_by_user_id = auth.uid() and coalesce(is_approved, false) = false);
