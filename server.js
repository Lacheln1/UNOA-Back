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
import kakaoAuthRoutes from './routes/kakaoAuthRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import userRoutes from './routes/userRoutes.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS 허용 도메인 설정 (수정됨)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://unoa-front.vercel.app',
      'https://unoa.vercel.app', 
      'https://unoa-h-jukyungs-projects.vercel.app'
    ]
  : [
      'http://localhost:3000',
      'http://localhost:3001', 
      process.env.FRONTEND_URL
    ].filter(Boolean); // undefined 값 제거

console.log('🔗 허용된 Origins:', allowedOrigins);
console.log('📍 현재 환경:', process.env.NODE_ENV);

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      console.log('🌐 Socket.IO 요청 Origin:', origin);
      // origin이 없는 경우 허용 (모바일 앱, Postman 등)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ Socket.IO CORS 차단된 origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 데이터베이스 연결
await connectDatabase();

// CORS 설정 (수정됨)
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🌐 HTTP 요청 Origin:', origin);
      
      // origin이 없는 경우 허용 (서버 간 통신, 모바일 앱, Postman 등)
      if (!origin) {
        return callback(null, true);
      }
      
      // 허용된 도메인에 포함되어 있는지 확인
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ HTTP CORS 차단된 origin:', origin);
        console.log('❌ 허용된 origins:', allowedOrigins);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// 미들웨어 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 헬스체크 엔드포인트 (CORS 테스트용)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: allowedOrigins
  });
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'UNOA Backend Server',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/auth/kakao', kakaoAuthRoutes);
app.use('/api', apiRoutes);
app.use('/api/user', userRoutes);

// Socket.IO 연결 설정
setupSocketConnection(io);

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `경로 ${req.originalUrl}을 찾을 수 없습니다.`
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ 서버 에러:', err);
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Cross-Origin Request Blocked',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 서버 시작
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ${PORT}포트에서 서버 작동 중...`);
  console.log(`📍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API 엔드포인트: https://maximum-gaby-lachlen-b63dfcf0.koyeb.app/api`);
  console.log(`🔗 허용된 Origins:`, allowedOrigins);
});