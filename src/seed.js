// Stocks the catalog with the opening shelf of titles.
//   npm run seed           -> adds any of these books that are missing (safe to re-run)
//   npm run seed -- --reset -> removes every book first, then adds these
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Book = require('./models/Book');

const books = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 499,
    category: 'Self-Help',
    description: 'A practical framework for getting 1% better every day. James Clear explains how tiny changes compound into remarkable results, and shows how to design your environment so good habits become obvious and easy while bad ones become invisible and unattractive. Packed with real stories from athletes, artists and business leaders, it is one of the most useful books on behaviour change you can own.',
    image: '/images/books/atomic-habits.jpg',
    isbn: '978-1-84794-183-1',
    publisher: 'Random House Business',
    publicationYear: 2018,
    pages: 320,
    language: 'English',
    format: 'Paperback'
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    price: 399,
    category: 'Finance',
    description: 'Doing well with money has less to do with how smart you are and more to do with how you behave. Through nineteen short, readable stories, Morgan Housel explores the strange ways people think about wealth, greed, risk and happiness — and why saving, patience and "enough" matter more than chasing the highest returns.',
    image: '/images/books/psychology-of-money.jpg',
    isbn: '978-93-90166-26-8',
    publisher: 'Jaico Publishing House',
    publicationYear: 2020,
    pages: 252,
    language: 'English',
    format: 'Paperback'
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    price: 350,
    category: 'Fiction',
    description: 'Santiago, a young Andalusian shepherd, dreams of a treasure hidden near the Egyptian pyramids and sets out across the desert to find it. Along the way he meets a gypsy woman, a king, an Englishman and an alchemist, each teaching him to listen to his heart and follow his Personal Legend. This 25th anniversary edition includes a new foreword by the author.',
    image: '/images/books/the-alchemist.jpg',
    isbn: '978-0-06-231500-7',
    publisher: 'HarperOne',
    publicationYear: 2014,
    pages: 208,
    language: 'English',
    format: 'Paperback'
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    price: 599,
    category: 'History',
    description: 'Seventy thousand years ago at least six human species walked the earth; today there is only us. Yuval Noah Harari traces how Homo sapiens came to dominate the planet — through the Cognitive, Agricultural and Scientific Revolutions — and asks what money, religion, empires and science have done to our happiness. Bold, wide-ranging and endlessly debatable.',
    image: '/images/books/sapiens.jpg',
    isbn: '978-0-09-959008-8',
    publisher: 'Vintage',
    publicationYear: 2015,
    pages: 512,
    language: 'English',
    format: 'Paperback'
  },
  {
    title: 'Ikigai: The Japanese Secret to a Long and Happy Life',
    author: 'Héctor García & Francesc Miralles',
    price: 450,
    category: 'Self-Help',
    description: 'In Okinawa, home to more centenarians than almost anywhere on earth, people talk about ikigai — the reason you get up in the morning. Based on interviews with the island\'s oldest residents, this gentle, hopeful book looks at the food, friendships, movement and sense of purpose that help them live long and joyful lives.',
    image: '/images/books/ikigai.jpg',
    isbn: '978-1-78633-089-5',
    publisher: 'Hutchinson',
    publicationYear: 2017,
    pages: 208,
    language: 'English',
    format: 'Hardcover'
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    price: 499,
    category: 'Fiction',
    description: 'Between life and death there is a library, and within it the shelves go on forever. Each book offers Nora Seed the chance to try another life she could have lived — rock star, glaciologist, Olympic swimmer, wife, mother. A warm, funny and moving novel about regret, possibility and discovering what makes a life worth living.',
    image: '/images/books/the-midnight-library.jpg',
    isbn: '978-1-78689-273-7',
    publisher: 'Canongate Books',
    publicationYear: 2020,
    pages: 304,
    language: 'English',
    format: 'Paperback'
  }
];

async function seed() {
  await connectDB();

  if (process.argv.includes('--reset')) {
    const { deletedCount } = await Book.deleteMany({});
    console.log(`Removed ${deletedCount} existing book(s).`);
  }

  let added = 0;
  for (const book of books) {
    const result = await Book.updateOne(
      { isbn: book.isbn },
      { $setOnInsert: book },
      { upsert: true }
    );
    if (result.upsertedCount) {
      added += 1;
      console.log(`  + ${book.title}`);
    }
  }
  console.log(`Done. Added ${added} book(s); ${books.length - added} already in the catalog.`);
}

seed()
  .catch((err) => {
    console.error(`Seeding failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
