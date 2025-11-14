-- Row Level Security setup and helper functions.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select true from public.users where id = uid and roli = 'Admin'),
    false
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.artikuj enable row level security;
alter table public.tregu_listime enable row level security;

drop policy if exists "Users: read own or admin" on public.users;
drop policy if exists "Users: insert self" on public.users;
drop policy if exists "Users: update self" on public.users;
drop policy if exists "Users: admins manage" on public.users;

create policy "Users: read own or admin" on public.users
  for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Users: insert self" on public.users
  for insert
  with check (
    (auth.uid() = id and roli = 'Individ')
    or public.is_admin(auth.uid())
  );

create policy "Users: update self" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and roli = 'Individ');

create policy "Users: admins manage" on public.users
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Organizations: public view" on public.organizations;
drop policy if exists "Organizations: members view" on public.organizations;
drop policy if exists "Organizations: insert by authenticated" on public.organizations;
drop policy if exists "Organizations: admin manage" on public.organizations;

create policy "Organizations: public view" on public.organizations
  for select
  using (eshte_aprovuar = true);

create policy "Organizations: members view" on public.organizations
  for select
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = organizations.id
        and om.user_id = auth.uid()
    )
  );

create policy "Organizations: insert by authenticated" on public.organizations
  for insert
  with check (auth.uid() is not null and coalesce(eshte_aprovuar, false) = false);

create policy "Organizations: admin manage" on public.organizations
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Org members: select" on public.organization_members;
drop policy if exists "Org members: insert self" on public.organization_members;
drop policy if exists "Org members: admin manage" on public.organization_members;

create policy "Org members: select" on public.organization_members
  for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "Org members: insert by member or admin" on public.organization_members
  for insert
  with check (
    (user_id = auth.uid() and coalesce(eshte_aprovuar, false) = false)
    or public.is_admin(auth.uid())
  );

create policy "Org members: admin manage" on public.organization_members
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Artikuj: view published" on public.artikuj;
drop policy if exists "Artikuj: admin manage" on public.artikuj;

create policy "Artikuj: view published" on public.artikuj
  for select
  using (
    eshte_publikuar = true
    or public.is_admin(auth.uid())
    or autori_id = auth.uid()
  );

create policy "Artikuj: admin manage" on public.artikuj
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Listings: view approved or owner" on public.tregu_listime;
drop policy if exists "Listings: insert by owner" on public.tregu_listime;
drop policy if exists "Listings: admin manage" on public.tregu_listime;

create policy "Listings: view approved or owner" on public.tregu_listime
  for select
  using (
    eshte_aprovuar = true
    or created_by_user_id = auth.uid()
    or public.is_admin(auth.uid())
  );

create policy "Listings: insert by owner" on public.tregu_listime
  for insert
  with check (created_by_user_id = auth.uid() and coalesce(eshte_aprovuar, false) = false);

create policy "Listings: admin manage" on public.tregu_listime
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
