import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    // 기존 데이터의 id를 저장하고 싶다면 추가 (선택사항)
    originalId: { type: String },

    category: { type: String, required: true, index: true },
    title: { type: String, required: true },

    // 숫자 값으로 저장하여 나중에 '5만원 이하 요금제' 같은 쿼리가 가능하도록 Number 타입 유지
    price: { type: Number, required: true },
    optionalContractDiscount: { type: Number },
    premierContractDiscount: { type: Number }, // null일 수 있으므로 required: false
    popularityRank: { type: Number },

    // 문자열 또는 null이 가능한 필드들
    ageGroup: { type: String },
    data: { type: String },
    postExhaustionDataSpeed: { type: String },
    tethering: { type: String },
    tetheringAndSharing: { type: String },
    voiceCall: { type: String },
    sms: { type: String },
    basicBenefit: { type: [String] },
    premiumBenefit: { type: [String] },
    mediaBenefit: { type: [String] },
    smartDevice: { type: [String] },
    signatureFamilyDiscount: { type: [String] },

    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
