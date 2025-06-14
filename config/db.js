import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    });
    console.log('MongoDB 연결됨');
  } catch (err) {
    console.log('MongoDB 연결 안됨', err);
    process.exit(1);
  }
};

export default connectDB;
