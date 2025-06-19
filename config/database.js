import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    });
    console.log('✅ MongoDB 연결됨');
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err);
    process.exit(1);
  }
};

// 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose가 MongoDB에 연결되었습니다');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose 연결이 끊어졌습니다');
});
