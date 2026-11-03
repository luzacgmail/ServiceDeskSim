create sequence ticket_seq start 10482;
create table profiles(id uuid primary key references auth.users on delete cascade, username text unique not null, difficulty text default 'normal', created_at timestamptz default now());
create table tickets(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
 number text unique default 'INC-'||nextval('ticket_seq'), subject text not null, description text not null,
 status text default 'New', priority text default 'P3', category text, assignee uuid,
 persona jsonb not null default '{}', sla_due timestamptz default now()+interval '8 hours', created_at timestamptz default now());
create table ticket_messages(id uuid primary key default gen_random_uuid(), ticket_id uuid references tickets on delete cascade, user_id uuid not null references auth.users,
 sender text check(sender in('agent','customer','internal')) not null, body text not null, created_at timestamptz default now());
create table ticket_activity(id uuid primary key default gen_random_uuid(), ticket_id uuid references tickets on delete cascade, user_id uuid not null references auth.users, action text not null, created_at timestamptz default now());
create table knowledge_articles(id uuid primary key default gen_random_uuid(), title text not null, body text not null, category text);
create table tutorial_progress(user_id uuid primary key references auth.users on delete cascade, step int default 0, done boolean default false);
create table feedback_reports(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users, ticket_id uuid references tickets, response_secs int, category_correct boolean, process_followed boolean, csat int, created_at timestamptz default now());
create table login_attempts(username text primary key, failures int default 0, locked_until timestamptz);
alter table profiles enable row level security; alter table tickets enable row level security; alter table ticket_messages enable row level security;
alter table ticket_activity enable row level security; alter table knowledge_articles enable row level security; alter table tutorial_progress enable row level security;
alter table feedback_reports enable row level security; alter table login_attempts enable row level security;
create policy own on profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy own on tickets for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own on ticket_messages for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own on ticket_activity for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own on tutorial_progress for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own on feedback_reports for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy read_all on knowledge_articles for select using(auth.role()='authenticated');
