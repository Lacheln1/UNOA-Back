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

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        'https://unoa-front.vercel.app',
        'https://unoa.vercel.app', 
        'https://unoa-h-jukyungs-projects.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

console.log('🔗 허용된 Origins:', allowedOrigins);
console.log('📍 현재 환경:', process.env.NODE_ENV);

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log('🌐 Socket.IO 요청 Origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
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

// CORS 설정
app.use(
  cors({
    origin: (origin, callback) => {
      console.log('🌐 HTTP 요청 Origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ HTTP CORS 차단된 origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// 미들웨어 설정
app.use(express.json());
app.use(cookieParser());

// 🔥 루트 경로 핸들러 추가 (중요!)
app.get('/', (req, res) => {
  res.json({
    message: '🚀 UNOA Backend API Server',
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8000,
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      kakaoAuth: '/api/auth/kakao',
      user: '/api/user'
    }
  });
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected',
    allowedOrigins: allowedOrigins
  });
});

// API 테스트 엔드포인트
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    requestOrigin: req.get('origin') || 'No origin header'
  });
});

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/auth/kakao', kakaoAuthRoutes);
app.use('/api', apiRoutes);
app.use('/api/user', userRoutes);

// Socket.IO 연결 설정
setupSocketConnection(io);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `경로 ${req.originalUrl}을 찾을 수 없습니다.`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      api: '/api',
      test: '/api/test'
    }
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
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 ${PORT}포트에서 서버 작동 중...`);
  console.log(`📍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 서버 URL: https://maximum-gaby-lachlen-b63dfcf0.koyeb.app`);
  console.log(`🔗 허용된 Origins:`, allowedOrigins);
  console.log(`📋 환경변수 확인:`);
  console.log(`   - PORT: ${process.env.PORT}`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   - FRONTEND_URL: ${process.env.FRONTEND_URL}`);
});