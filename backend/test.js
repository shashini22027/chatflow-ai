require('dotenv').config();
const connectDB = require('./src/config/db');

connectDB()
    .then(() => {
        console.log('MongoDB connection successful');
        process.exit(0);
    })
    .catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
