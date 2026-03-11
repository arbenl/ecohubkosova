-- Ensure row level security is enabled for all public tables exposed via PostgREST.
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.artikuj enable row level security;
alter table public.tregu_listime enable row level security;
alter table public.cities enable row level security;

-- RLS policies for the cities table (public read, admin manage).
drop policy if exists "Cities: public read active" on public.cities;
drop policy if exists "Cities: admin manage" on public.cities;

create policy "Cities: public read active" on public.cities
  for select
  using (is_active = true);

create policy "Cities: admin manage" on public.cities
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
