# Inkwell Lane

Inkwell Lane is an online bookstore. Customers browse a hand-picked catalog, search by title or author, filter by category, add books to a cart, and order with cash on delivery. They don't need an account. A password-protected admin panel lets the store owner manage the catalog, update order statuses and read messages sent through the contact form.

The site is server-rendered with **Express**, **EJS** and **MongoDB**. It has a modern navy-and-indigo design and fills the full width of the screen on phones, tablets and large desktops alike.

## Features

### For customers
- **One-page home**: a full-width page with every section in one place. The menu scrolls to each section and highlights the one in view:
  - **Hero**: featured book covers and a search bar
  - **Books**: the whole catalog, with category filters
  - **How it works**: three steps from cart to delivery
  - **About**: the store's story, a photo gallery, why readers choose us, and a quote banner
  - **Contact**: a contact form (name, email, phone, order number, topic, message) beside the store's address, phone, email, opening hours and quick answers
- **Browse**: search by title or author, plus category filters with book counts
- **Book pages**: cover, price, description and full specifications (ISBN, publisher, publication year, pages, language, format), plus related titles from the same category
- **Cart**: change quantities (up to 20 copies per title) or remove items. Books removed from the catalog are cleared automatically
- **Checkout**: delivery details only, then pay in cash on delivery
- **My Orders**: order history and status tracking, tied to the visitor's browser session

### For the store owner (`/admin`)
- Add, edit and delete books, with a live cover preview
- Upload a cover image (JPG, PNG, WEBP or GIF, up to 4 MB) or paste a cover image URL
- Orders dashboard with one-click status changes: Processing → Shipped → Delivered / Cancelled
- Messages inbox for contact-form submissions, with reply-by-email links

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

## Pages

| URL | Page |
|---|---|
| `/` | One-page home: hero, books, how it works, about, contact |
| `/#books`, `/#about`, `/#contact` | Jump straight to a home-page section (`/about` and `/contact` redirect here) |
| `/books` | Search results and category filters |
| `/books/:id` | Book details |
| `/cart` | Shopping cart |
| `/checkout` | Delivery details and order placement |
| `/orders`, `/orders/:id` | Order history and order tracking |
| `/admin/login` | Admin sign-in |
| `/admin/books` | Catalog management (add, edit, delete books) |
| `/admin/orders` | Orders dashboard |
| `/admin/messages` | Contact-form messages |

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
- **Message**: a contact-form submission (name, email, phone, topic, order number, message)

## Project structure

```
api/index.js         serverless entry point (exports the Express app)
src/
  server.js          app entry point (connects to the database, starts the server)
  app.js             Express setup: sessions, routes, 404 and error pages
  seed.js            the opening catalog
  config/            database connection, upload settings
  models/            Book, Order, CoverImage, Message
  middleware/        admin guard, shared template values
  routes/            shop, cart, orders, admin, covers
  utils/             cart and catalog helpers
views/               EJS pages, admin pages and shared partials
public/
  css/style.css      site styles
  js/main.js         mobile menu, section highlighting, confirm dialogs, cover preview
  images/books/      book cover images
  images/about/      photos for the About section
```

## Image credits

- Book covers: [Open Library Covers](https://openlibrary.org/dev/docs/api/covers)
- About section photos: [Unsplash](https://unsplash.com), free to use under the [Unsplash License](https://unsplash.com/license)
