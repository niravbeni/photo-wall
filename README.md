# Photo Wall

A team photo wall built with Next.js 16, React 19, and Tailwind CSS 4. Data and images are stored in Supabase (free tier).

## Features

- Grid of team member cards with photos
- Individual member profile pages with bio, focus areas, and contact links
- Admin panel at `/admin` for adding, editing, and deleting members
- Image uploads via Supabase Storage

## Setup

### 1. Clone and install

```bash
git clone https://github.com/niravbeni/photo-wall.git
cd photo-wall
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project
2. Open the **SQL Editor** in your Supabase dashboard
3. Paste the contents of `supabase/migration.sql` and run it — this creates the `members` table and the `member-photos` storage bucket with the correct permissions

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project values (found in Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub (already done if you cloned from the link above)
2. Go to [vercel.com](https://vercel.com) and import the `photo-wall` repository
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Deploy

## Data Model

Each team member has:

| Field | Type | Description |
|---|---|---|
| `slug` | text (PK) | URL-safe identifier, auto-generated from name |
| `name` | text | Full name (required) |
| `role` | text | Job title |
| `photo` | text | URL to photo (Supabase Storage) |
| `joinedAt` | text | When they joined (free-form, e.g. "December, 2021") |
| `focusAreas` | string[] | Bullet points for "My focus" section |
| `personalFacts` | string[] | Bullet points for "What you won't learn from my bio" |
| `email` | text | Contact email |
| `linkedin` | text | LinkedIn profile URL |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Database**: Supabase Postgres (free tier)
- **Image Storage**: Supabase Storage (free tier)
- **Hosting**: Vercel (free tier)
