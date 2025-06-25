import Plan from '../models/Plan.js';
import { logTokenUsage } from '../utils/helpers.js';

/**
 * @param {Array} plans - DB에서 가져온 전체 요금제 객체 배열
 * @returns {Array} AI가 분석하기 좋게 요약된 요금제 객체 배열
 */
const summarizePlans = (plans) => {
  return plans.map((plan) => ({
    title: plan.title,
    price: plan.price,
    data: plan.data,
    postExhaustionDataSpeed: plan.postExhaustionDataSpeed,
    tetheringAndSharing: plan.tetheringAndSharing,
    optionalContractDiscount: plan.optionalContractDiscount,
    premierContractDiscount: plan.premierContractDiscount,
    voiceCall: plan.voiceCall,
    voiceCallFirstDes: plan.voiceCallFirstDes,
    sms: plan.sms,
    premiumBenefit: plan.premiumBenefit,
    mediaBenefit: plan.mediaBenefit,
    description: plan.description,
    popularityRank: plan.popularityRank,
  }));
};

/**
 * MongoDB에서 모든 요금제 정보를 가져와
 * AI에게 전달할 systemPrompt를 동적으로 생성하는 함수
 */
export const generateSystemPrompt = async () => {
  try {
    const allPlansFromDB = await Plan.find({}).lean();
    const summarizedPlans = summarizePlans(allPlansFromDB);

    const systemPrompt = `당신은 LG U+의 전담 요금제 컨설턴트 'NOA'입니다. 고객의 라이프스타일과 니즈를 파악해서 딱 맞는 요금제를 찾아드리는 전문가입니다.

### 🎯 핵심 미션
- 충분한 상담을 통해 고객이 진짜 만족할 수 있는 요금제 찾기
- 친근하면서도 전문적인 톤으로 신뢰감 주기
- 복잡한 통신 용어를 쉽고 친근하게 설명하기

### 📊 사용 가능한 요금제 데이터
${JSON.stringify(summarizedPlans, null, 2)}

## 상담 프로세스 (3단계)

### 1️⃣ 니즈 파악 단계
**필수 파악 정보 (최소 4가지):**
1. 데이터 사용 패턴 2. 예산 범위 3. 연령대 4. 주요 사용 용도 5. 추가 기기 필요 여부 6. 원하는 혜택 7. 할인 선호도

**규칙:**
- 7가지 중 최소 5가지 파악될 때까지 추천 금지
- 질문은 한 번에 1-2개씩, 자연스러운 대화로
- 요금제명은 반드시 **굵은 글씨** 로 표시 ('**' 닫는 태그 뒤 공백추가하여 마크다운 깨짐 현상 방지)
- 굵은 글씨 및 줄바꿈 말고는 다른 마크다운 형태 금지 (리스트나 제목형태 절대 금지! )

### 2️⃣ 분석 & 확인 단계
수집된 정보를 간결하게 요약하고, **그 답변에 이어서 바로 3단계 최종 추천 실행** (구분선없이)

**중요:** "잠시만 기다려주세요" 같이 답변을 끝내고 다음 입력을 기다리는 행동 절대 금지

### 3️⃣ 최종 추천 단계
**추천 지침:**
1. 고객 맞춤 혜택 강조 (premiumBenefit/mediaBenefit 중 관심사 연결)
2. 부가 통화 안내 (voiceCallFirstDes 정보 활용)
3. 상세 스펙은 카드에 양보, 텍스트는 매력적 설명 위주
4. 추천 개수: 최대 3개
5. 연령대 필터링 필수 (키즈/유쓰/시니어 등)

## 🎨 대화 스타일
- "좋은 질문이에요!" / "고객님 같은 경우엔…" (개인화)
- 이모지 적절히 사용, 상냥한 톤 
- 기술 용어 과다 사용 금지
- 번호 매기기 나열 금지

## 🚫 범위 외 대응
타사 비교, 기술 문제, 결제 관련 등 LG U+ 요금제 관련하지 않는 내용은 회피
"LG U+ 요금제 전문이라 그 부분은 어려워요. 대신 맞춤 요금제 찾아드릴게요! 😊"`;

    logTokenUsage(systemPrompt, '채팅 모드');
    return systemPrompt;
  } catch (error) {
    console.error('System prompt 생성 중 오류 발생:', error);
    throw new Error('Failed to generate system prompt with plan data.');
  }
};

//간단모드
export const generateSimpleModePrompt = async (userAnswers = null) => {
  try {
    const allPlansFromDB = await Plan.find({}).lean();

    // 사용자 답변이 있으면 관련 요금제만 필터링
    let relevantPlans = allPlansFromDB;

    if (userAnswers) {
      relevantPlans = filterPlansByAnswers(allPlansFromDB, userAnswers);
    }

    const summarizedPlans = summarizePlans(relevantPlans);

    const systemPrompt = `LG U+ 요금제 추천 AI NOA입니다. 프론트엔드에서 수집된 구조화된 답변을 바탕으로 최적 요금제 1개를 추천해주세요.

### 요금제 데이터:
${JSON.stringify(summarizedPlans, null, 2)}

### 추천 방식:
사용자 답변 → 조건 매칭 → **요금제명** 굵게 표시하여 1개 추천
가격 정보: 기본가격 + 할인 가능성 함께 안내
간결하고 친근한 톤으로 핵심만 설명`;

    logTokenUsage(systemPrompt, '간단 모드');
    return systemPrompt;
  } catch (error) {
    console.error('간단모드 프롬프트 생성 오류:', error);
    throw new Error('프롬프트 생성 실패');
  }
};

//비교모드
export const generateComparePrompt = (plansToCompare) => {
  const systemPrompt = `당신은 LG U+의 요금제 비교분석 전문가 'NOA'입니다. 두 요금제의 핵심 차이점을 쉽고 간결하게 요약해주세요.

### 비교할 요금제 데이터:
${JSON.stringify(plansToCompare, null, 2)}

### 비교 가이드:
1. **핵심 차이점 1~2개** 언급 (데이터량, 가격, 혜택 등)
2. **적합 사용자** 명확히 추천
3. 각 요금제별로 1문장씩 요약, 총 2 요금제에 대해 2문장으로 설명!!
4. 최대한 간소하게 요약!! 
5. 모든 요금제명은 **굵게** 표시
6. 첫번째요금제 설명 후 줄바꿈 이후 두번째 요금제 설명.

### 예시 톤:
"**5G 프리미어 플러스**는 데이터 무제한 + 넷플릭스 혜택을 원하는 분께 ~ 추천드려요!
**5G 스탠다드** 는 합리적 가격으로 충분한 데이터를 쓰고 싶은 분께 적합해요! 😊"`;

  return systemPrompt;
};

// 사용자 답변 기반 요금제 필터링
const filterPlansByAnswers = (plans, answers) => {
  let filtered = [...plans];

  // 연령대 필터링
  if (answers['연령대']) {
    const ageGroup = answers['연령대'];
    if (ageGroup === '만 12세 이하') {
      filtered = filtered.filter((p) => p.title.includes('키즈'));
    } else if (ageGroup === '만 13~18세') {
      filtered = filtered.filter(
        (p) => p.title.includes('유쓰') || !p.title.match(/(키즈|시니어)/)
      );
    } else if (ageGroup === '만 65세 이상') {
      filtered = filtered.filter(
        (p) => p.title.includes('시니어') || !p.title.match(/(키즈|유쓰)/)
      );
    } else {
      // 만 19~64세는 연령제한 요금제 제외
      filtered = filtered.filter((p) => !p.title.match(/(키즈|유쓰|시니어)/));
    }
  }

  // 예산 필터링
  if (answers['현제 요금제 요금']) {
    const budget = answers['현제 요금제 요금'];
    let maxPrice = 100000; // 기본값

    if (budget === '2만 원 이하') maxPrice = 20000;
    else if (budget === '2~4만 원') maxPrice = 40000;
    else if (budget === '4~6만 원') maxPrice = 60000;
    else if (budget === '6만 원 이상') maxPrice = 140000;

    if (maxPrice < 100000) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }
  }

  // 기기 타입 필터링
  if (answers['휴대폰 요금제']) {
    const deviceType = answers['휴대폰 요금제'];
    if (deviceType === 'LTE예요') {
      filtered = filtered.filter((p) => p.title.includes('LTE'));
    } else if (deviceType === '5G예요') {
      filtered = filtered.filter((p) => p.title.includes('5G'));
    }
  }

  // 추가 기기 필터링
  if (answers['기기 보유'] === '네, 태블릿이나 스마트 워치도 있어요') {
    // 태블릿, 워치 관련 요금제 우선 선택
    const devicePlans = filtered.filter(
      (p) =>
        p.title.includes('태블릿') ||
        p.title.includes('워치') ||
        p.title.includes('듀얼')
    );
    if (devicePlans.length > 0) {
      filtered = devicePlans;
    }
  }

  return filtered;
};
