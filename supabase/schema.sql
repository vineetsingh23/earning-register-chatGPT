-- Run this whole file once in Supabase: Dashboard > SQL Editor > New query > Run.
create table if not exists stations (
  name text primary key,
  has_sv4 boolean not null default false,
  has_parking boolean not null default false,
  created_at timestamptz not null default now()
);
insert into stations (name, has_sv4, has_parking) values
  ('Noida Electronic City', true, true),
  ('Sector 62 Noida', false, false)
on conflict (name) do nothing;

create table if not exists station_settings (
  station text primary key references stations(name) on delete cascade,
  shift_rows int not null default 15,
  tvm_rows int not null default 15,
  updated_at timestamptz not null default now()
);
-- one row per operator shift row / TVM row; all column values live in "data"
create table if not exists shift_entries (
  station text not null references stations(name) on delete cascade,
  entry_date date not null,
  row_no int not null,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (station, entry_date, row_no)
);
create table if not exists tvm_entries (
  station text not null references stations(name) on delete cascade,
  entry_date date not null,
  row_no int not null,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (station, entry_date, row_no)
);
-- kind: oe = out-source earning, ms = misc earning, pd = penalty details
create table if not exists daily_lists (
  station text not null references stations(name) on delete cascade,
  entry_date date not null,
  kind text not null check (kind in ('oe','ms','pd')),
  rows jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  primary key (station, entry_date, kind)
);
-- cash in possession (note counts, coin counts, loose coins)
create table if not exists cash_counts (
  station text not null references stations(name) on delete cascade,
  entry_date date not null,
  counts jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (station, entry_date)
);
create table if not exists bank_transfers (
  station text not null references stations(name) on delete cascade,
  entry_date date not null,
  amount numeric not null,
  slip_no text not null,
  denominations jsonb not null default '{}',
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (station, entry_date)
);

create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
do $$ declare t text; begin
  foreach t in array array['station_settings','shift_entries','tvm_entries','daily_lists','cash_counts','bank_transfers'] loop
    execute format('drop trigger if exists trg_touch on %I', t);
    execute format('create trigger trg_touch before update on %I for each row execute function touch_updated_at()', t);
  end loop;
end $$;

-- Row Level Security. The app only has a station dropdown (no passwords), so these
-- policies let the anon key read/write everything. Fine for a private/internal tool.
-- For real security, enable Supabase Auth and change "to anon" to "to authenticated".
do $$ declare t text; begin
  foreach t in array array['stations','station_settings','shift_entries','tvm_entries','daily_lists','cash_counts','bank_transfers'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists app_all on %I', t);
    execute format('create policy app_all on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;
