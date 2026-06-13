-- Shoe Laundry database schema

create type user_role as enum ('customer', 'admin');
create type logistics_type as enum ('pickup_delivery', 'dropoff');
create type order_status as enum (
  'confirmed', 'pickup_scheduled', 'picked_up', 'dropped_off',
  'cleaning', 'quality_check', 'ready', 'out_for_delivery', 'completed', 'cancelled'
);
create type payment_status as enum ('unpaid', 'paid');

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
  name text not null,
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

-- Helper: check admin role
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- RLS
alter table profiles enable row level security;
alter table services enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_events enable row level security;

-- Profiles
create policy "profiles read own or admin" on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles update own" on profiles for update using (auth.uid() = id);
create policy "profiles insert own" on profiles for insert with check (auth.uid() = id);
create policy "profiles admin read all" on profiles for select using (is_admin());

-- Services
create policy "services public read active" on services for select using (is_active = true or is_admin());
create policy "services admin write" on services for all using (is_admin());

-- Addresses
create policy "addresses own" on addresses for all using (auth.uid() = user_id);
create policy "addresses admin read" on addresses for select using (is_admin());

-- Orders
create policy "orders customer read own" on orders for select using (auth.uid() = customer_id or is_admin());
create policy "orders customer insert own" on orders for insert with check (auth.uid() = customer_id and payment_status = 'unpaid');
create policy "orders admin update" on orders for update using (is_admin());
create policy "orders admin read" on orders for select using (is_admin());

-- Order items
create policy "order_items via order" on order_items for all using (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
);

-- Status events
create policy "events via order" on order_status_events for select using (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
);
create policy "events insert customer or admin" on order_status_events for insert with check (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
);

-- Seed services
insert into services (name, description, base_price, estimated_days) values
  ('Standard Clean', 'Basic wash and dry for everyday sneakers.', 35000, 2),
  ('Deep Clean', 'Deep scrub, deodorize, and sole whitening.', 65000, 3),
  ('Premium Restore', 'Full restoration for leather and suede pairs.', 120000, 5),
  ('Express Clean', 'Same-day service for urgent orders.', 85000, 1),
  ('Sole Repair', 'Minor sole and stitching repair.', 50000, 4)
on conflict do nothing;

-- Create admin profile after signing up admin user in Supabase Auth:
-- update profiles set role = 'admin' where email = 'admin@shoelaundry.com';
