import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Plan from '../models/Plan.js';

dotenv.config();

/**
 * JSON의 원본 데이터를 Mongoose 스키마에 맞게 변환하고 정제하는 함수
 * @param {object} plan - 원본 요금제 객체
 * @param {string} category - 카테고리 이름
 * @returns {object} 스키마에 맞는 형태로 변환된 객체
 */
const transformPlan = (plan, category) => {
  return {
    ...plan,
    category,
    originalId: plan.id,
    price: parseInt(plan.price, 10) || 0,
    optionalContractDiscount:
      parseInt(plan.optionalContractDiscount, 10) || null,
    premierContractDiscount: parseInt(plan.premierContractDiscount, 10) || null,
    popularityRank: parseInt(plan.popularityRank, 10) || 999,
  };
};

/**
 * 데이터베이스 시딩을 수행하는 메인 비동기 함수
 */
const seedDB = async () => {
  let connection; // finally 블록에서 사용하기 위해 외부에 변수 선언
  try {
    const dataPath = path.resolve(process.cwd(), 'data', 'initialPlans.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const planDatabase = JSON.parse(jsonData);

    const allPlansToSeed = [
      ...(planDatabase['5GLTE'] || []).map((p) =>
        transformPlan(p, '5G/LTE 요금제')
      ),
      ...(planDatabase['Online'] || []).map((p) =>
        transformPlan(p, '온라인 다이렉트 요금제')
      ),
      ...(planDatabase['TabWatch'] || []).map((p) =>
        transformPlan(p, '태블릿/워치 요금제')
      ),
      ...(planDatabase['Dual'] || []).map((p) =>
        transformPlan(p, '듀얼심 요금제')
      ),
    ];

    if (allPlansToSeed.length === 0) {
      throw new Error(
        '처리할 데이터가 0개입니다. JSON 파일 내용을 확인하세요.'
      );
    }

    // 데이터베이스 연결 및 작업 수행
    console.log('MongoDB에 연결을 시도합니다...');
    connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB에 성공적으로 연결되었습니다.');

    console.log('기존 요금제 데이터를 삭제합니다...');
    await Plan.deleteMany({});
    console.log('기존 데이터 삭제 완료.');

    console.log(`${allPlansToSeed.length}개의 새로운 데이터를 삽입합니다...`);
    const result = await Plan.insertMany(allPlansToSeed);
    console.log(
      `✅ 성공: ${result.length}개의 문서가 성공적으로 삽입되었습니다!`
    );
  } catch (error) {
    console.error('❗️ 스크립트 실행 중 치명적인 오류가 발생했습니다:', error);
    process.exit(1); // 오류 발생 시 프로세스 종료
  } finally {
    // 연결이 성공적으로 이루어졌을 경우에만 연결을 닫습니다.
    if (connection) {
      await connection.disconnect();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }
};

// 스크립트 실행
seedDB();
