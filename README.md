# Photo Wall

A team photo wall built with Next.js 16, React 19, and Tailwind CSS 4. Data and images are stored in Vercel Blob (free tier).

## Features

- Grid of team member cards with photos
- Individual member profile pages with bio, focus areas, and contact links
- Admin panel at `/admin` for adding, editing, and deleting members
- Image uploads via Vercel Blob

## Setup

### 1. Clone and install

```bash
git clone https://github.com/niravbeni/photo-wall.git
cd photo-wall
npm install
```

### 2. Create a Vercel Blob store

1. Go to [vercel.com](https://vercel.com) and import this repo as a project
2. In the project dashboard, go to **Storage** → **Create** → **Blob**
3. Connect the Blob store to your project — this automatically adds the `BLOB_READ_WRITE_TOKEN` env var

### 3. Run locally

For local development, copy the token from your Vercel project settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your `BLOB_READ_WRITE_TOKEN` (found in Vercel → Project → Storage → Blob → Settings).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the **Admin** panel to add team members.

## Deploy to Vercel

If you already connected the Blob store (step 2 above), just push to `main` — Vercel auto-deploys. The `BLOB_READ_WRITE_TOKEN` is injected automatically, no manual env var setup needed.

## How Data is Stored

All member data lives in a single `data/team.json` blob in Vercel Blob. Images are uploaded as individual blobs under `members/`. There is no database — just flat files in Vercel's CDN-backed object store.

| Blob path | Contents |
|---|---|
| `data/team.json` | JSON array of all team members |
| `members/{slug}-{hash}.{ext}` | Individual member photos |

### Data model per member

| Field | Type | Description |
|---|---|---|
| `slug` | text | URL-safe identifier, auto-generated from name |
| `name` | text | Full name (required) |
| `role` | text | Job title |
| `photo` | text | URL to photo in Vercel Blob |
| `joinedAt` | text | When they joined (e.g. "December, 2021") |
| `focusAreas` | string[] | Bullet points for "My focus" section |
| `personalFacts` | string[] | Bullet points for "What you won't learn from my bio" |
| `email` | text | Contact email |
| `linkedin` | text | LinkedIn profile URL |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Storage**: Vercel Blob (free tier — data + images)
- **Hosting**: Vercel (free tier)
