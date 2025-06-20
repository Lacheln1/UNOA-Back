import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// 로컬 모듈 import
import { connectDatabase } from './config/database.js';
import { setupSocketConnection } from './handlers/socketHandlers.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// 데이터베이스 연결
await connectDatabase();

// CORS 설정
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);

// 미들웨어 설정
app.use(express.json());
app.use(cookieParser());

// 회원가입 라우터 연결 (/api/auth/register)
app.use('/api/auth', authRoutes);

// API 라우트 설정
app.use('/api', apiRoutes);

// Socket.IO 연결 설정
setupSocketConnection(io);

// 서버 시작
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ${PORT}포트에서 서버 작동 중...`);
  console.log(`📍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API 엔드포인트: http://localhost:${PORT}/api`);
});
