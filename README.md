# Inkwell Lane

An independent online bookstore, built with **Express + EJS + MongoDB** (server-rendered, sessions stored in MongoDB). Customers browse and search the catalog, add books to a cart, and check out with cash on delivery. An admin panel manages the catalog and order statuses.

Runs locally with `npm run dev`. On Vercel it runs as one serverless function.

## Features

**Shop**
- Home page with search, a cover showcase, shopping by category, and new arrivals
- Browse page with text search (title/author) and category filters
- Book detail pages with full specifications (ISBN, publisher, year, pages, language, format) and related titles
- Session-based cart (update quantities, remove items, up to 20 copies per title)
- Cash-on-delivery checkout with delivery details
- Order history and order tracking (no account needed: orders are tied to your browser session)

**Admin (`/admin/login`)**
- Add, edit and delete books. Covers can be uploaded (JPG, PNG, WEBP or GIF, max 4 MB) or added by pasting an image URL
- Order dashboard with one-click status updates (Processing → Shipped → Delivered / Cancelled)

**Opening catalog**: `npm run seed` stocks 6 titles with real covers and details: *Atomic Habits*, *The Psychology of Money*, *The Alchemist*, *Sapiens*, *Ikigai* and *The Midnight Library*.

**Deliberately not included**
- No online payments (cash on delivery only)
- No email sending or SMTP configuration
- No customer accounts or password storage

## Requirements

- Node.js 20+
- MongoDB: a local install, or a free MongoDB Atlas cluster (Vercel requires Atlas)

## Run locally

```bash
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm run seed              # adds the 6 opening books
npm run dev               # open http://localhost:3000
```

Admin panel: http://localhost:3000/admin/login, using the `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`.

## Environment variables

| Variable         | Purpose                                                       |
|------------------|---------------------------------------------------------------|
| `MONGODB_URI`    | MongoDB connection string. Defaults to `mongodb://127.0.0.1:27017/inkwell-lane` |
| `SESSION_SECRET` | Long random string (32+ characters) used to sign session cookies |
| `ADMIN_USERNAME` | Admin login username                                          |
| `ADMIN_PASSWORD` | Admin login password                                          |
| `NODE_ENV`       | `production` on Vercel (enables secure cookies)               |
| `PORT`           | Local port (default 3000; ignored on Vercel)                  |

## Deploy to Vercel

1. **Create a MongoDB Atlas database** (free M0 tier) at https://www.mongodb.com/cloud/atlas
   - *Database Access*: add a database user with a password.
   - *Network Access*: add `0.0.0.0/0` (Vercel servers use changing IP addresses).
   - *Connect → Drivers*: copy the connection string and add a database name before the `?`:
     `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/inkwell-lane?retryWrites=true&w=majority`
2. **Seed Atlas once from your machine.** Put the Atlas URI in `.env` as `MONGODB_URI`, then run `npm run seed`.
3. **Push the project to GitHub.** Make the `booknest` folder (the one with `package.json`) the repository root.
4. **Import the repository on Vercel** (https://vercel.com/new). Leave Framework Preset as **Other** and leave the build and output settings empty.
5. **Add these Environment Variables** in the project settings: `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `NODE_ENV=production`.
6. **Deploy.** Every later `git push` redeploys automatically.

How it runs on Vercel: `vercel.json` sends every request that isn't a static file in `public/` to `api/index.js`, which exports the Express app. The MongoDB connection is cached between invocations. Uploaded covers are stored in MongoDB (`coverimages` collection) and served from `/covers/:id`, because Vercel's filesystem is read-only.

## Commands

- `npm run dev`: start with nodemon (auto-restart)
- `npm start`: start the app
- `npm run seed`: add the opening catalog (safe to re-run; `npm run seed -- --reset` wipes all books first)
- `npm run check`: syntax-check the entry files

## Project structure

```
api/index.js         Vercel serverless entry (exports the Express app)
vercel.json          Vercel routing + function config
src/
  server.js          local entry point (DB connect + listen)
  app.js             express app wiring, sessions, 404 + error handlers
  seed.js            opening catalog
  config/            cached db connection, multer upload config
  models/            Mongoose models (Book, Order, CoverImage)
  middleware/        admin guard, template locals
  routes/            shop, cart, orders, admin, covers
  utils/             cart helpers, search/category helpers
views/               EJS templates (partials + pages + admin)
public/              css, js, book cover images
```
