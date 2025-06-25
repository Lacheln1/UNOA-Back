import OpenAI from 'openai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Plan from '../models/Plan.js';
import Conversation from '../models/Conversation.js';
import { getClientIP } from '../utils/helpers.js';
import {
  generateSimpleModePrompt,
  generateSystemPrompt,
} from '../services/promptService.js';

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
  RESET_CONVERSATION: 'reset-conversation',
};

/**
 * 사용자의 IP와 브라우저 정보(User Agent)를 기반으로 고유한 세션 ID를 생성
 * @param {string} ip - 사용자 IP 주소
 * @param {string} userAgent - 사용자 브라우저 정보
 * @returns {string} 생성된 고유 세션 ID
 */
const getSessionIdForUser = (ip, userAgent) => {
  const hash = crypto
    .createHash('sha256')
    .update(ip + userAgent)
    .digest('hex');
  return `ip_${hash.substring(0, 16)}`;
};

// 정규식으로 특수문자제거
const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * 사용자 메시지 처리, AI 응답 생성, 대화 저장 등 핵심 로직을 담당하는 핸들러
 */
const handleUserMessage = async (socket, data, clientIP, userAgent) => {
  try {
    const { text, history, mode } = data;
    const sessionId = getSessionIdForUser(clientIP, userAgent);

    if (mode === 'simple') {
      console.log('간단 모드 메시지 수신. AI 응답을 생성하지 않습니다.');
      const dynamicSystemPrompt = await generateSimpleModePrompt();

      const messagesToSent = [
        {
          role: 'system',
          content: dynamicSystemPrompt,
        },
        {
          role: 'user',
          content: `다음은 사용자의 요금제 관련 정보입니다. ${text} 이 사용자의 상황에 가장 적합한 LG U+ 요금제를 추천해주세요.
요금제 이름만 말해주세요.`,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1.mini',
        messages: messagesToSent,
        temperature: 0,
        stream: false,
      });

      const fullResponse = completion.choices[0]?.message?.content || '';

      const allPlanTitles = (await Plan.find({}, 'title').lean()).map(
        (p) => p.title
      );

      const sortedPlanTitles = allPlanTitles.sort(
        (a, b) => b.length - a.length
      );

      let tempResponse = fullResponse;
      const recommendedPlanTitles = [];

      for (const title of sortedPlanTitles) {
        if (tempResponse.includes(title)) {
          recommendedPlanTitles.push(title);
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

      return;
    }

    // 1. AI에게 전달할 최신 정보가 담긴 시스템 프롬프트를 동적으로 생성
    const dynamicSystemPrompt = await generateSystemPrompt();

    // 2. OpenAI API에 보낼 메시지 목록을 준비
    const messagesToSent = [
      { role: 'system', content: dynamicSystemPrompt },
      ...history
        .filter((msg) => msg.role !== 'card')
        .map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: text },
    ];

    // 3. OpenAI 스트리밍 API를 호출하여 AI의 응답을 실시간 받음
    const stream = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
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
    console.log('스트림 데이터 수신 완료.');

    const allPlansFromDB = await Plan.find({}, 'title').lean();
    const allPlanTitles = allPlansFromDB.map((plan) => plan.title);
    const sortedPlanTitles = allPlanTitles.sort((a, b) => b.length - a.length);

    let tempResponse = fullResponse.replaceAll('**', '');
    const recommendedPlanTitles = [];

    for (const title of sortedPlanTitles) {
      if (tempResponse.includes(title)) {
        recommendedPlanTitles.push(title);
        const escapedTitle = escapeRegExp(title);
        tempResponse = tempResponse.replace(new RegExp(escapedTitle, 'g'), '');
      }
    }

    let recommendedPlansData = null;
    if (recommendedPlanTitles.length > 0) {
      recommendedPlansData = await Plan.find({
        title: { $in: recommendedPlanTitles },
      }).lean();
      console.log(
        `${recommendedPlansData.length}개의 추천 카드 데이터를 DB에서 찾았습니다.`
      );
    }

    // 대화 저장 로직 (카드 데이터 생성 후)
    await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: [
            { role: 'user', content: text },
            {
              role: 'assistant',
              content: fullResponse,
              recommendedPlans: recommendedPlansData,
            },
          ],
        },
        $set: {
          'metadata.lastAccessIP': clientIP,
          'metadata.lastAccessUserAgent': userAgent,
          'metadata.lastAccessTime': new Date(),
        },
        $setOnInsert: {
          'metadata.ipAddress': clientIP,
          'metadata.userAgent': userAgent,
        },
      },
      { upsert: true }
    );
    console.log(`대화가 성공적으로 저장되었습니다: ${sessionId}`);

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

/**
 * 소켓 서버의 모든 연결 및 이벤트 리스너를 설정하는 메인 함수
 * @param {object} io - Socket.IO 서버 인스턴스
 */
export const setupSocketConnection = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const clientIP = getClientIP(socket);
    const userAgent = socket.handshake.headers['user-agent'] || '';
    console.log(`클라이언트 연결: ${socket.id}, IP: ${clientIP}`);

    // [이벤트] 세션 초기화: 클라이언트가 연결되면, IP 기반으로 이전 대화 기록을 찾아 보냄
    socket.on(SOCKET_EVENTS.INIT_SESSION, async () => {
      try {
        const sessionId = getSessionIdForUser(clientIP, userAgent);
        const conversation = await Conversation.findOne({ sessionId }).lean();
        if (conversation && conversation.messages.length > 0) {
          socket.emit(
            SOCKET_EVENTS.CONVERSATION_HISTORY,
            conversation.messages
          );
        } else {
          socket.emit(SOCKET_EVENTS.CONVERSATION_HISTORY, []);
        }
      } catch (error) {
        console.error('대화 기록 로딩 중 오류 발생:', error);
        socket.emit(SOCKET_EVENTS.CONVERSATION_HISTORY, []);
      }
    });

    // [이벤트] 사용자 메시지 수신
    socket.on(SOCKET_EVENTS.USER_MESSAGE, (data) => {
      handleUserMessage(socket, data, clientIP, userAgent);
    });

    // [이벤트] 대화 초기화 요청
    socket.on(SOCKET_EVENTS.RESET_CONVERSATION, async () => {
      try {
        const sessionId = getSessionIdForUser(clientIP, userAgent);
        await Conversation.deleteOne({ sessionId });
        socket.emit(SOCKET_EVENTS.CONVERSATION_HISTORY, []);
      } catch (error) {
        console.error('대화 기록 삭제 중 오류 발생:', error);
      }
    });

    // [이벤트] 연결 종료
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`클라이언트 연결 끊김: ${socket.id}, IP: ${clientIP}`);
    });
  });
};
