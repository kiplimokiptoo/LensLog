# LensLog

**LensLog** is a fun, responsive movie tracking web app where film lovers can discover movies, build a watchlist, rate what they've watched, and review their favorites. Built with React and Firebase, powered by the TMDB API.

## Tech Stack
- React + React Router
- Firebase (Auth + Firestore)
- TMDB API
- Netlify (Deployment)
- Jest + React Testing Library

## Project Objectives
1. React routing across multiple pages
2. Authentication / social Auth (Google via Firebase)
3. Deployment through Netlify
4. Fully responsive design
5. Data persistence via Firestore without localStorage or browser caching
6. 30% test coverage
7. Standard application flow
8. Semantic versioning release (v1.0.0)

## User Stories
1. **Auth** — As a movie enthusiast, I want to sign in with my Google account so that my watchlist and ratings are saved and accessible from any device.
2. **Search** — As a user, I want to search for movies by title so that I can find films I'm interested in before deciding to watch.
3. **Watchlist** — As a user, I want to add movies to my personal watchlist so that I can keep track of films I plan to watch.
4. **Rate & Review** — As a user, I want to mark a movie as watched and leave a star rating with a short review so that I can remember my thoughts.
5. **Profile** — As a user, I want to view my profile showing my watch count and top-rated movies so that I can see my movie history at a glance.
6. **Discover** — As a user, I want to see a feed of recently logged movies from all users so that I can find inspiration from what others are watching.

## Getting Started

1. Copy `.env.example` to `.env` and add your Firebase and TMDB credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Run tests:
   ```bash
   npm test
   ```

## Netlify Deployment

This repository includes `netlify.toml`, so Netlify can detect the build command and publish directory automatically.

1. Import the GitHub repository in Netlify.
2. Use these build settings:
   ```bash
   Build command: npm run build
   Publish directory: dist
   ```
3. Add these environment variables in Netlify under Site configuration → Environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_TMDB_API_KEY`
4. Add your Netlify domain to Firebase Authentication:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your generated `*.netlify.app` domain and any custom domain you connect later.
5. Deploy from Netlify. The included redirect rule serves `index.html` for client-side routes like `/search`, `/discover`, and `/profile`.

## Version
`v1.0.0`
