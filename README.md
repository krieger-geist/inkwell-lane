# Inkwell Lane

Inkwell Lane is an online bookstore. Customers browse a hand-picked catalog, search by title or author, filter by category, add books to a cart, and order with cash on delivery. They don't need an account. A password-protected admin panel lets the store owner manage the catalog and update order statuses.

The site is server-rendered with **Express**, **EJS** and **MongoDB**. It has a modern navy-and-indigo design and works on phones as well as desktops.

## Features

### For customers
- **Home page**: a banner with featured book covers, a search bar, shopping by category, new arrivals, and a short "how ordering works" guide
- **Browse**: search by title or author, plus category filters with book counts
- **Book pages**: cover, price, description and full specifications (ISBN, publisher, publication year, pages, language, format), plus related titles from the same category
- **Cart**: change quantities (up to 20 copies per title) or remove items. Books removed from the catalog are cleared automatically
- **Checkout**: delivery details only, then pay in cash on delivery
- **My Orders**: order history and status tracking, tied to the visitor's browser session
- **About and Contact** pages with store information and quick answers

### For the store owner (`/admin`)
- Add, edit and delete books, with a live cover preview
- Upload a cover image (JPG, PNG, WEBP or GIF, up to 4 MB) or paste a cover image URL
- Orders dashboard with one-click status changes: Processing → Shipped → Delivered / Cancelled

### Deliberately left out
- Online payments (cash on delivery only)
- Customer accounts and stored passwords
- Email notifications

## Catalog

The store opens with six titles, each with its real cover and publication details:

| Title | Author | Category | Price |
|---|---|---|---|
| Atomic Habits | James Clear | Self-Help | ₹499 |
| The Psychology of Money | Morgan Housel | Finance | ₹399 |
| The Alchemist | Paulo Coelho | Fiction | ₹350 |
| Sapiens: A Brief History of Humankind | Yuval Noah Harari | History | ₹599 |
| Ikigai: The Japanese Secret to a Long and Happy Life | Héctor García & Francesc Miralles | Self-Help | ₹450 |
| The Midnight Library | Matt Haig | Fiction | ₹499 |

## Tech stack

| Layer | Technology |
|---|---|
| Server | Node.js, Express 5 |
| Views | EJS templates (server-side rendering) |
| Database | MongoDB with Mongoose |
| Sessions | express-session, stored in MongoDB (connect-mongo) |
| Uploads | Multer. Uploaded covers are stored in MongoDB and served from `/covers/:id` |
| Styling | Hand-written CSS with design tokens. Fonts: DM Serif Display and Plus Jakarta Sans |

## Data model

- **Book**: title, author, price, category, description, cover image, ISBN, publisher, publication year, pages, language, format
- **Order**: the ordered items (a snapshot of title, price and quantity), delivery details, total, status, and the session that placed it
- **CoverImage**: the image data and type for an uploaded cover

## Project structure

```
api/index.js         serverless entry point (exports the Express app)
src/
  server.js          app entry point (connects to the database, starts the server)
  app.js             Express setup: sessions, routes, 404 and error pages
  seed.js            the opening catalog
  config/            database connection, upload settings
  models/            Book, Order, CoverImage
  middleware/        admin guard, shared template values
  routes/            shop, cart, orders, admin, covers
  utils/             cart and catalog helpers
views/               EJS pages, admin pages and shared partials
public/
  css/style.css      site styles
  js/main.js         mobile menu, confirm dialogs, cover preview
  images/books/      book cover images
```
