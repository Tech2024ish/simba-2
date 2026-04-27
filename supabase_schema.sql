-- Run this entire file in the Supabase SQL Editor

-- Products table
create table if not exists products (
  id integer primary key,
  name text not null,
  price numeric not null,
  category text not null,
  subcategory_id integer,
  in_stock boolean default true,
  image text,
  unit text default 'Pcs'
);

-- User profiles
create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  role text default 'buyer' check (role in ('buyer', 'market_rep')),
  phone text,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  customer_name text,
  customer_email text,
  items jsonb not null,
  total numeric not null,
  status text default 'pending' check (status in ('pending','approved','rejected','delivered')),
  payment_method text,
  phone text,
  address text,
  city text,
  created_at timestamptz default now()
);

-- RLS
alter table products enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;

create policy "Products are public" on products for select using (true);

create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Buyers see own orders" on orders for select
  using (auth.uid() = user_id or exists (
    select 1 from profiles where id = auth.uid() and role = 'market_rep'
  ));
create policy "Buyers insert orders" on orders for insert with check (auth.uid() = user_id);
create policy "Market reps update orders" on orders for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'market_rep'));

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
