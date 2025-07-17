#  Wrappify

**Spotify Wrapped — every month.**

Wrappify is a web app that lets Spotify users generate and save their personal "Spotify Wrapped" at the end of each month, where they can see their top tracks and artists, save monthly snapshots, and revisit their wraps anytime.

---

## Features

- **Spotify authentication** via NextAuth.js
- **Monthly wrap** of top tracks and artists (based on Spotify short-term data)
- **Save and revisit** past wraps using Supabase
- **Smooth UI animations** and responsive layout with CSS-in-JS
- **Server-side rendering** for fast loads and SEO
- **Deployed on Vercel** for public access

---

## Tech Stack

- **Next.js** (App Framework)
- **React** (Frontend UI)
- **NextAuth.js** (Spotify OAuth)
- **Supabase** (Database + Auth)
- **Vercel** (Hosting & CI)
- **Spotify Web API** (Data source)

---

## To use

1. **Clone the repo**
   ```bash
   git clone https://github.com/virajmisra/wrappify
   cd wrappify
   npm install
   ```

2. **Create `.env.local`**

   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

3. **Run the app**
   ```bash
   npm run dev
   ```

---

## Limitations

Due to Spotify API limitations in developer mode:
- Only **25 test users** can be added to the app
- You must manually add each tester via the Spotify Developer Dashboard - email me and include your Spotify email to be added.
- The Wrapped becomes available only on the **29th of each month**

---

## Visit the app (Best viewed on desktop)

Live app: [https://wrappify-six.vercel.app](https://wrappify-six.vercel.app)

---

## Author

Built by [Viraj Misra](https://www.linkedin.com/in/viraj-misra/) — feel free to connect!
