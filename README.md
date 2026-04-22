# Photo Wall

A team photo wall built with Next.js 16, React 19, and Tailwind CSS 4. Data and images are stored in Vercel Blob (free tier, zero external accounts).

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

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import the `photo-wall` repository
2. Vercel automatically provisions a Blob store when you add the integration -- go to your project's **Storage** tab and click **Create Database** → **Blob**
3. Vercel injects the `BLOB_READ_WRITE_TOKEN` env var automatically
4. Deploy

### 3. Run locally (optional)

Copy the `BLOB_READ_WRITE_TOKEN` from your Vercel project settings into a local `.env.local`:

```bash
cp .env.example .env.local
# edit .env.local with the token from Vercel → Project → Settings → Environment Variables
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How Data Storage Works

All data lives in **Vercel Blob** (included free with Vercel Hobby plan):

| What | How |
|---|---|
| Member data (name, role, bio, etc.) | Single JSON blob (`team-data.json`) |
| Member photos | Individual image blobs (`members/name-xxxx.jpg`) |

The admin panel at `/admin` reads and writes these blobs via API routes. No database or external service needed.

## Data Model

Each team member has:

| Field | Type | Description |
|---|---|---|
| `slug` | text (PK) | URL-safe identifier, auto-generated from name |
| `name` | text | Full name (required) |
| `role` | text | Job title |
| `photo` | text | URL to photo (Vercel Blob) |
| `joinedAt` | text | When they joined (e.g. "December, 2021") |
| `focusAreas` | string[] | Bullet points for "My focus" section |
| `personalFacts` | string[] | Bullet points for "What you won't learn from my bio" |
| `email` | text | Contact email |
| `linkedin` | text | LinkedIn profile URL |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Storage**: Vercel Blob (free tier -- data + images)
- **Hosting**: Vercel (free tier)
