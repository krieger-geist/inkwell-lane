require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const port = Number(process.env.PORT) || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Inkwell Lane is running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
