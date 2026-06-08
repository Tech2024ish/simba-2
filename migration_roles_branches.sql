-- Run this in the Supabase SQL Editor to migrate from the old single 'market_rep'
-- role to the new 'admin' / 'branch_manager' roles, and add branch scoping.

-- 1. Add branch columns
alter table profiles add column if not exists branch text;
alter table orders add column if not exists branch text;

-- 2. Drop the old constraint FIRST — while it's in place, neither 'admin' nor
--    'market_rep' can coexist as valid values for the data migration below
alter table profiles drop constraint if exists profiles_role_check;

-- 3. Migrate existing market reps to admin (reassign specific accounts to
--    'branch_manager' + set their branch afterwards if needed) — runs with NO
--    constraint in place, so this cannot fail no matter the current values
update profiles set role = 'admin' where role = 'market_rep';

-- 4. Now that all rows hold valid new-style roles, add the new constraint
alter table profiles add constraint profiles_role_check check (role in ('buyer', 'admin', 'branch_manager'));

-- 4. Replace order RLS policies that referenced 'market_rep'
drop policy if exists "Buyers see own orders" on orders;
drop policy if exists "Market reps update orders" on orders;

create policy "Staff and owners see relevant orders" on orders for select
  using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'branch_manager' and p.branch = orders.branch
    )
  );

create policy "Staff update relevant orders" on orders for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'branch_manager' and p.branch = orders.branch
    )
  );

-- 5. Update the signup trigger to also capture 'branch' from user metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, branch, phone, address, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'branch',
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'address', ''),
    coalesce(new.raw_user_meta_data->>'city', 'Kigali')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 6. (Optional) assign a branch manager — replace the email and branch name
-- update profiles set role = 'branch_manager', branch = 'Kimironko'
--   where id = (select id from auth.users where email = 'manager@test.com');
