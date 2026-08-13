# My Diary

A personal web diary at **https://mydiary.kristinn.eu**.

- Sign in with **GitHub** or **Google**
- Write a note about your day and save it
- **Full Diary** tab: browse all entries in a readable format, filter by date range, search phrases, and filter by tag
- Tag entries (e.g. `travel`, `family`) and click a tag to read the full story for that tag in chronological order

## How it works

Static single-page app (plain HTML/CSS/JS, no build step) hosted on GitHub Pages.
Backend is [Supabase](https://supabase.com) (project `kristinnthor's Project`, ref `ikrborprotbvygphjphl`):

- **Auth**: Supabase Auth with GitHub and Google OAuth providers
- **Data**: `diary_entries` table with row-level security — each user can only read/write their own entries

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `user_id` | uuid | references `auth.users`, enforced by RLS |
| `entry_date` | date | the day the entry is about |
| `content` | text | the diary text |
| `tags` | text[] | lowercase tags, GIN-indexed |
| `created_at` / `updated_at` | timestamptz | |

There is also a `diary_tags` table (`user_id`, `tag`, RLS owner-only) holding each user's
remembered tags, shown as quick-pick chips in the Write tab. Tags are remembered
automatically when an entry is saved; forgetting a tag removes it from the chip list
without touching existing entries.

## One-time setup (manual steps)

The code and database are ready. Three things must be configured by hand:

### 1. DNS

Add a CNAME record for the subdomain:

```
mydiary.kristinn.eu  CNAME  kristinnthor.github.io
```

### 2. GitHub Pages

In the repo: **Settings → Pages**
- Source: **GitHub Actions**
- Custom domain: `mydiary.kristinn.eu` (then enable **Enforce HTTPS** once the certificate is issued)

The included workflow (`.github/workflows/deploy.yml`) deploys on every push to `main`.

### 3. OAuth providers in Supabase

Dashboard → project `ikrborprotbvygphjphl` → **Authentication → Sign In / Up → Auth Providers**.

The callback URL for both providers is:

```
https://ikrborprotbvygphjphl.supabase.co/auth/v1/callback
```

**GitHub**
1. Create an OAuth app at https://github.com/settings/developers → *New OAuth App*
   - Homepage URL: `https://mydiary.kristinn.eu`
   - Authorization callback URL: the Supabase callback URL above
2. Copy the Client ID and a Client Secret into the GitHub provider settings in Supabase and enable it.

**Google**
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** (type *Web application*)
   - Authorized JavaScript origins: `https://mydiary.kristinn.eu`
   - Authorized redirect URIs: the Supabase callback URL above
2. Copy the Client ID and Client Secret into the Google provider settings in Supabase and enable it.

**Redirect URLs** (Supabase → Authentication → URL Configuration):
- Add `https://mydiary.kristinn.eu` to **Redirect URLs**.
- If the Site URL is used by another app, leave it as is — this app always passes an explicit `redirectTo`.

For local testing, also add `http://localhost:8000` (or whatever port you use) to the Redirect URLs, then serve the folder with e.g. `python3 -m http.server 8000`.

## Development

No build step, no dependencies. Edit the three files and refresh:

- `index.html` — structure and screens
- `style.css` — styling
- `app.js` — Supabase client, auth, entries, filtering
