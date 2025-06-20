import OpenAI from 'openai';
import dotenv from 'dotenv';
import Plan from '../models/Plan.js';
import { getClientIP, generateSessionId } from '../utils/helpers.js';
import { generateSystemPrompt } from '../services/promptService.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const handleUserMessage = async (socket, data) => {
  try {
    const { text, history, mode } = data;
    console.log(`수신된 메시지 (Mode: ${mode}):`, text);

    if (mode === 'simple') {
      console.log('간단 모드 메시지 수신. AI 응답을 생성하지 않습니다.');
      return;
    }

    const dynamicSystemPrompt = await generateSystemPrompt();

    const messagesToSent = [
      { role: 'system', content: dynamicSystemPrompt },
      ...history
        .filter((msg) => msg.role !== 'card')
        .map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: text },
    ];

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesToSent,
      stream: true,
    });

    socket.emit(SOCKET_EVENTS.STREAM_START, {
      messageId: 'temp-' + Date.now(),
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
    console.log('스트림 데이터 수신 완료. 전체 응답 길이:', fullResponse.length);

    const allPlanTitles = (await Plan.find({}, 'title').lean()).map(
      (p) => p.title
    );

    const sortedPlanTitles = allPlanTitles.sort((a, b) => b.length - a.length);
    
    let tempResponse = fullResponse;
    const recommendedPlanTitles = [];

    for (const title of sortedPlanTitles) {
      if (tempResponse.includes(title)) {
        recommendedPlanTitles.push(title);
        // ✨ 여기가 수정된 부분입니다. ✨
        // 정규식 대신, 특수문자를 그대로 인식하는 replaceAll을 사용하여 더 안정적으로 변경합니다.
        tempResponse = tempResponse.replaceAll(title, '');
      }
    }

    let recommendedPlansData = null;
    if (recommendedPlanTitles.length > 0) {
      recommendedPlansData = await Plan.find({
        title: { $in: recommendedPlanTitles },
      }).lean();
      console.log(
        `${recommendedPlanTitles.length}개의 추천 요금제 데이터를 DB에서 찾았습니다:`,
        recommendedPlanTitles
      );
    }

    socket.emit(SOCKET_EVENTS.STREAM_END, {
      message: {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      },
      recommendedPlans: recommendedPlansData,
    });
  } catch (error) {
    console.error('❗ [CRITICAL ERROR] 메시지 처리 중 오류 발생:', error);
    socket.emit(SOCKET_EVENTS.ERROR, {
      message: '메시지 처리 중 오류가 발생했습니다.',
    });
  }
};

export const setupSocketConnection = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const clientIP = getClientIP(socket);
    const userAgent = socket.handshake.headers['user-agent'] || '';

    console.log(`클라이언트 연결: ${socket.id}, IP: ${clientIP}`);

    socket.on(SOCKET_EVENTS.INIT_SESSION, () => {
      console.log(`세션 초기화 완료. 빈 대화 기록 전송: ${socket.id}`);
      socket.emit(SOCKET_EVENTS.CONVERSATION_HISTORY, []);
    });

    socket.on(SOCKET_EVENTS.USER_MESSAGE, (data) => {
      handleUserMessage(socket, data);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`클라이언트 연결 끊김: ${socket.id}, IP: ${clientIP}`);
    });
  });
};
