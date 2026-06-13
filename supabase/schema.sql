-- Shoe Laundry — production schema
-- Run once via: npm run db:setup  (requires SUPABASE_DB_URL in .env)
-- Or paste into Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type logistics_type as enum ('pickup_delivery', 'dropoff');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum (
    'confirmed', 'pickup_scheduled', 'picked_up', 'dropped_off',
    'cleaning', 'quality_check', 'ready', 'out_for_delivery', 'completed', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'paid');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text default '',
  base_price int not null,
  estimated_days int not null default 2,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text not null default 'Home',
  street text not null,
  city text not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  logistics_type logistics_type not null,
  status order_status not null default 'confirmed',
  pickup_address_id uuid references addresses(id),
  scheduled_at timestamptz not null,
  subtotal int not null default 0,
  delivery_fee int not null default 0,
  total int not null default 0,
  payment_method text not null default 'cash',
  payment_status payment_status not null default 'unpaid',
  amount_received int,
  payment_confirmed_at timestamptz,
  payment_confirmed_by uuid references profiles(id),
  payment_note text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  service_id uuid not null references services(id),
  shoe_type text not null,
  quantity int not null default 1,
  unit_price int not null,
  photo_url text,
  notes text
);

create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Auth trigger — auto-create profile on sign-up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'user'), '@', 1)),
    nullif(new.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, profiles.name),
    phone = coalesce(excluded.phone, profiles.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table services enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_events enable row level security;

-- Profiles
drop policy if exists "profiles read own or admin" on profiles;
drop policy if exists "profiles admin read all" on profiles;
drop policy if exists "profiles update own" on profiles;
drop policy if exists "profiles insert own" on profiles;
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_update" on profiles;
drop policy if exists "profiles_insert" on profiles;

create policy "profiles_select" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update" on profiles
  for update using (auth.uid() = id);
create policy "profiles_insert" on profiles
  for insert with check (auth.uid() = id);

-- Services
drop policy if exists "services public read active" on services;
drop policy if exists "services admin write" on services;
drop policy if exists "services_select" on services;
drop policy if exists "services_admin_write" on services;

create policy "services_select" on services
  for select using (is_active = true or is_admin());
create policy "services_admin_write" on services
  for all using (is_admin()) with check (is_admin());

-- Addresses
drop policy if exists "addresses own" on addresses;
drop policy if exists "addresses admin read" on addresses;
drop policy if exists "addresses_own" on addresses;
drop policy if exists "addresses_admin_read" on addresses;

create policy "addresses_own" on addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "addresses_admin_read" on addresses
  for select using (is_admin());

-- Orders
drop policy if exists "orders customer read own" on orders;
drop policy if exists "orders customer insert own" on orders;
drop policy if exists "orders admin update" on orders;
drop policy if exists "orders admin read" on orders;
drop policy if exists "orders_select" on orders;
drop policy if exists "orders_customer_insert" on orders;
drop policy if exists "orders_admin_update" on orders;

create policy "orders_select" on orders
  for select using (auth.uid() = customer_id or is_admin());
create policy "orders_customer_insert" on orders
  for insert with check (auth.uid() = customer_id and payment_status = 'unpaid');
create policy "orders_admin_update" on orders
  for update using (is_admin()) with check (is_admin());

-- Order items
drop policy if exists "order_items via order" on order_items;
drop policy if exists "order_items_select" on order_items;
drop policy if exists "order_items_insert" on order_items;

create policy "order_items_select" on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_id and (o.customer_id = auth.uid() or is_admin())
    )
  );
create policy "order_items_insert" on order_items
  for insert with check (
    exists (
      select 1 from orders o
      where o.id = order_id and (o.customer_id = auth.uid() or is_admin())
    )
  );

-- Status events
drop policy if exists "events via order" on order_status_events;
drop policy if exists "events insert customer or admin" on order_status_events;
drop policy if exists "events_select" on order_status_events;
drop policy if exists "events_insert" on order_status_events;

create policy "events_select" on order_status_events
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_id and (o.customer_id = auth.uid() or is_admin())
    )
  );
create policy "events_insert" on order_status_events
  for insert with check (
    exists (
      select 1 from orders o
      where o.id = order_id and (o.customer_id = auth.uid() or is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime (live order updates)
-- ---------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table orders;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table order_status_events;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Seed services (idempotent)
-- ---------------------------------------------------------------------------
insert into services (name, description, base_price, estimated_days) values
  ('Standard Clean', 'Basic wash and dry for everyday sneakers.', 35000, 2),
  ('Deep Clean', 'Deep scrub, deodorize, and sole whitening.', 65000, 3),
  ('Premium Restore', 'Full restoration for leather and suede pairs.', 120000, 5),
  ('Express Clean', 'Same-day service for urgent orders.', 85000, 1),
  ('Sole Repair', 'Minor sole and stitching repair.', 50000, 4)
on conflict (name) do nothing;

-- After first admin signs up via the app, run:
-- update profiles set role = 'admin' where email = 'admin@shoelaundry.com';
