const mongoose = require('mongoose');

const connectDB = async () => {
    console.log('Connecting to MongoDB...');
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        if (error.reason) console.error('Error Reason:', error.reason);
        process.exit(1);
    }
};

module.exports = connectDB;
