-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  supplier text,
  category text,
  color text,
  size text,
  price numeric not null,
  cost numeric not null,
  stock integer not null default 0,
  min_stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sales Table
create table public.sales (
  id uuid primary key default uuid_generate_v4(),
  total numeric not null,
  payment_method text,
  customer_name text,
  customer_phone text,
  sale_date timestamp with time zone default timezone('utc'::text, now()),
  items jsonb, -- Stores the cart items snapshot directly (id, name, quantity, price)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: The original design used a separate 'sale_items' table. 
-- However, for simplicity in the current implementation, we are also storing items as JSONB in the 'sales' table 
-- to facilitate easier retrieval of historical data without complex joins in the frontend. 
-- If you prefer relational integrity, you can uncomment and use the table below:

/*
-- Sale Items Table (Optional: Relational approach)
create table public.sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid references public.sales(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price numeric not null, -- Snapshot of price at time of sale
  product_name text -- Snapshot of name in case product is deleted
);
*/

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.sales enable row level security;
-- alter table public.sale_items enable row level security;

-- Create Policies (Public access for simplicity in this demo, usually you'd want auth)
create policy "Enable all access for all users" on public.products for all using (true) with check (true);
create policy "Enable all access for all users" on public.sales for all using (true) with check (true);
-- create policy "Enable all access for all users" on public.sale_items for all using (true) with check (true);
