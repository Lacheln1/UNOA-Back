import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getClientIP, generateSessionId } from '../utils/helpers.js';
import { generateSystemPrompt } from '../services/promptService.js';

dotenv.config();

// OpenAI 클라이언트 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 소켓 이벤트 이름을 상수로 관리하여 오타 방지 및 유지보수 용이성 확보
const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  INIT_SESSION: 'init-session',
  USER_MESSAGE: 'user-message',
  CONVERSATION_HISTORY: 'conversation-history',
  STREAM_START: 'stream-start',
  STREAM_CHUNK: 'stream-chunk',
  STREAM_END: 'stream-end',
  ERROR: 'error',
};

/**
 * 사용자 메시지 처리 및 AI 응답 생성 핸들러 (대화 저장 로직 없음)
 * @param {object} socket - 현재 사용자의 소켓 객체
 * @param {object} data - 클라이언트로부터 받은 데이터. { text: string, history: object[] } 형태를 기대.
 */
const handleUserMessage = async (socket, data) => {
  try {
    const { text, history, mode } = data;
    console.log(`수신된 메시지 (Mode: ${mode}):`, text);

    // 'simple' 모드에서는 AI 응답을 생성하지 않고 종료
    if (mode === 'simple') {
      console.log('간단 모드 메시지 수신. AI 응답을 생성하지 않습니다.');
      return;
    }

    console.log('일반 모드 메시지 수신. AI 응답을 생성합니다.');

    const dynamicSystemPrompt = await generateSystemPrompt();

    // 클라이언트가 보내준 이전 대화 내용과 새 메시지를 합쳐서 API에 전송
    const messagesToSent = [
      { role: 'system', content: dynamicSystemPrompt },
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: text },
    ];

    // OpenAI 스트리밍 API 호출
    const stream = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: messagesToSent,
      stream: true,
    });

    // 스트림 시작을 클라이언트에 알림
    socket.emit(SOCKET_EVENTS.STREAM_START, {
      messageId: 'temp-' + Date.now(), // 임시 ID
      timestamp: new Date().toISOString(),
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        socket.emit(SOCKET_EVENTS.STREAM_CHUNK, content);
      }
    }

    console.log(
      '스트림 데이터 수신 완료. 전체 응답 길이:',
      fullResponse.length
    );

    // 스트림 종료와 함께 완성된 메시지 전송
    socket.emit(SOCKET_EVENTS.STREAM_END, {
      message: {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❗ [CRITICAL ERROR] 메시지 처리 중 오류 발생:', error);
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: '메시지 처리 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 소켓 연결 및 이벤트 리스너 설정
 * @param {object} io - Socket.IO 서버 인스턴스
 */
export const setupSocketConnection = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const clientIP = getClientIP(socket);
    const userAgent = socket.handshake.headers['user-agent'] || '';

    console.log(`클라이언트 연결: ${socket.id}, IP: ${clientIP}`);

    // 세션 초기화: 항상 빈 대화 기록을 보냄
    socket.on(SOCKET_EVENTS.INIT_SESSION, () => {
      console.log(`세션 초기화 완료. 빈 대화 기록 전송: ${socket.id}`);
      socket.emit(SOCKET_EVENTS.CONVERSATION_HISTORY, []);
    });

    // 사용자 메시지 처리
    socket.on(SOCKET_EVENTS.USER_MESSAGE, (data) => {
      handleUserMessage(socket, data);
    });

    // 연결 종료
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`클라이언트 연결 끊김: ${socket.id}, IP: ${clientIP}`);
    });
  });
};
