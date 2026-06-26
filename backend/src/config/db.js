const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set in backend/.env');
    }

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
};

module.exports = connectDB;
