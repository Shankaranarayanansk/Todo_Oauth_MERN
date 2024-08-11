const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI );
    console.log("Connected to MongoDB");

    mongoose.connection.on('disconnected', () => {
      console.log('Disconnected from MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Reconnected to MongoDB');
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;