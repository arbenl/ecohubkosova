-- Initial schema derived from the legacy /scripts SQL files.
-- This migration creates all core tables and supporting indexes.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    emri_i_plote text not null,
    email text not null,
    vendndodhja text not null,
    roli text not null check (roli in ('Individ', 'Admin')),
    eshte_aprovuar boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    emri text not null,
    pershkrimi text not null,
    interesi_primar text not null,
    person_kontakti text not null,
    email_kontakti text not null,
    vendndodhja text not null,
    lloji text not null check (lloji in ('OJQ', 'Ndërmarrje Sociale', 'Kompani')),
    eshte_aprovuar boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table public.organization_members (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    roli_ne_organizate text not null,
    eshte_aprovuar boolean default true,
    created_at timestamp with time zone default now(),
    unique (organization_id, user_id)
);

create table public.artikuj (
    id uuid primary key default gen_random_uuid(),
    titulli text not null,
    permbajtja text not null,
    autori_id uuid not null references public.users(id) on delete cascade,
    eshte_publikuar boolean default false,
    kategori text not null,
    tags text[] default '{}'::text[],
    foto_kryesore text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table public.tregu_listime (
    id uuid primary key default gen_random_uuid(),
    created_by_user_id uuid not null references public.users(id) on delete cascade,
    organization_id uuid references public.organizations(id) on delete set null,
    titulli text not null,
    pershkrimi text not null,
    kategori text not null,
    cmimi numeric(10,2) not null,
    njesia text not null,
    vendndodhja text not null,
    sasia text not null,
    lloji_listimit text not null check (lloji_listimit in ('shes', 'blej')),
    eshte_aprovuar boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create index idx_users_roli on public.users(roli);
create index idx_organizations_approved on public.organizations(eshte_aprovuar);
create index idx_organizations_lloji on public.organizations(lloji);
create index idx_artikuj_published on public.artikuj(eshte_publikuar);
create index idx_artikuj_kategori on public.artikuj(kategori);
create index idx_tregu_approved on public.tregu_listime(eshte_aprovuar);
create index idx_tregu_lloji on public.tregu_listime(lloji_listimit);
create index idx_tregu_kategori on public.tregu_listime(kategori);
