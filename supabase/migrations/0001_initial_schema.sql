-- ============================================================================
-- Migration: 0001_initial_schema
-- Description: Create all core tables for AI Weekly Digest
-- ============================================================================

-- Enable the pgcrypto extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------------

create type digest_category as enum (
  'research',
  'product',
  'industry',
  'tools',
  'policy',
  'other'
);

create type blog_post_status as enum (
  'draft',
  'published',
  'archived'
);

create type email_template_type as enum (
  'welcome',
  'digest',
  'announcement',
  'reengagement'
);

create type social_platform as enum (
  'twitter',
  'linkedin',
  'instagram',
  'threads'
);

create type social_post_status as enum (
  'draft',
  'scheduled',
  'published',
  'failed'
);

-- ---------------------------------------------------------------------------
-- authors
-- ---------------------------------------------------------------------------

create table if not exists authors (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) <= 120),
  bio          text not null default '' check (char_length(bio) <= 500),
  avatar_url   text,
  social_links jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

comment on table authors is 'Blog post and digest content authors';

-- ---------------------------------------------------------------------------
-- digest_issues
-- ---------------------------------------------------------------------------

create table if not exists digest_issues (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) <= 160),
  title       text not null check (char_length(title) <= 300),
  week_label  text not null check (char_length(week_label) <= 60),
  summary     text not null check (char_length(summary) <= 2000),
  tags        text[] not null default '{}',
  published_at timestamptz not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table digest_issues is 'Weekly newsletter/digest editions';

-- ---------------------------------------------------------------------------
-- digest_items
-- ---------------------------------------------------------------------------

create table if not exists digest_items (
  id           uuid primary key default gen_random_uuid(),
  issue_id     uuid not null references digest_issues (id) on delete cascade,
  title        text not null check (char_length(title) <= 300),
  url          text not null,
  source       text not null check (char_length(source) <= 120),
  summary      text not null check (char_length(summary) <= 1000),
  category     digest_category not null,
  published_at timestamptz not null,
  position     integer not null default 0 check (position >= 0),
  created_at   timestamptz not null default now()
);

comment on table digest_items is 'Individual articles within a digest issue';

create index if not exists digest_items_issue_id_idx on digest_items (issue_id);
create index if not exists digest_items_category_idx  on digest_items (category);

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------

create table if not exists blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) <= 200),
  title           text not null check (char_length(title) <= 300),
  content         text not null,
  excerpt         text not null check (char_length(excerpt) <= 500),
  author_id       uuid not null references authors (id) on delete restrict,
  status          blog_post_status not null default 'draft',
  tags            text[] not null default '{}',
  cover_image_url text,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table blog_posts is 'Long-form blog articles';

create index if not exists blog_posts_author_id_idx on blog_posts (author_id);
create index if not exists blog_posts_status_idx    on blog_posts (status);
create index if not exists blog_posts_published_at_idx on blog_posts (published_at desc)
  where status = 'published';

-- ---------------------------------------------------------------------------
-- subscribers
-- ---------------------------------------------------------------------------

create table if not exists subscribers (
  id               uuid primary key default gen_random_uuid(),
  email            text not null unique check (char_length(email) <= 254),
  confirmed        boolean not null default false,
  subscribed_at    timestamptz not null default now(),
  unsubscribed_at  timestamptz,
  created_at       timestamptz not null default now()
);

comment on table subscribers is 'Newsletter subscriber list';

create index if not exists subscribers_email_idx on subscribers (email);

-- ---------------------------------------------------------------------------
-- email_templates
-- ---------------------------------------------------------------------------

create table if not exists email_templates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) <= 120),
  subject       text not null check (char_length(subject) <= 300),
  html_content  text not null,
  text_content  text not null,
  template_type email_template_type not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table email_templates is 'Reusable email templates (welcome, digest, etc.)';

-- ---------------------------------------------------------------------------
-- social_posts
-- ---------------------------------------------------------------------------

create table if not exists social_posts (
  id                   uuid primary key default gen_random_uuid(),
  platform             social_platform not null,
  content              text not null check (char_length(content) <= 2200),
  media_urls           text[] not null default '{}',
  status               social_post_status not null default 'draft',
  scheduled_at         timestamptz,
  published_at         timestamptz,
  related_issue_id     uuid references digest_issues (id) on delete set null,
  related_blog_post_id uuid references blog_posts (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table social_posts is 'Scheduled and published social media posts';

create index if not exists social_posts_platform_idx    on social_posts (platform);
create index if not exists social_posts_status_idx      on social_posts (status);
create index if not exists social_posts_scheduled_at_idx on social_posts (scheduled_at)
  where status = 'scheduled';

-- ---------------------------------------------------------------------------
-- updated_at trigger (shared function)
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger digest_issues_updated_at
  before update on digest_issues
  for each row execute function set_updated_at();

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();

create trigger email_templates_updated_at
  before update on email_templates
  for each row execute function set_updated_at();

create trigger social_posts_updated_at
  before update on social_posts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table authors          enable row level security;
alter table digest_issues    enable row level security;
alter table digest_items     enable row level security;
alter table blog_posts       enable row level security;
alter table subscribers      enable row level security;
alter table email_templates  enable row level security;
alter table social_posts     enable row level security;

-- Public read access for published content
create policy "Public can read published blog posts"
  on blog_posts for select
  using (status = 'published');

create policy "Public can read digest issues"
  on digest_issues for select
  using (true);

create policy "Public can read digest items"
  on digest_items for select
  using (true);

create policy "Public can read authors"
  on authors for select
  using (true);

-- Subscribers can insert their own row (anonymous sign-up)
create policy "Anyone can subscribe"
  on subscribers for insert
  with check (true);
