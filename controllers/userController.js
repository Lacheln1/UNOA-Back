import { User } from '../models/User.js';
import { Benefit } from '../models/Benefit.js';
import Plan from '../models/Plan.js';

export const getUserBenefits = async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user || !user.planInfo) {
      return res
        .status(404)
        .json({ message: '사용자 정보 또는 요금제 정보 없음' });
    }

    const { membership, years, title } = user.planInfo;

    const membershipBenefits = await Benefit.find({
      type: '멤버십',
      level: membership,
    });

    const longTermBenefits = await Benefit.find({
      type: '장기고객',
      level: years,
    });

    const plan = await Plan.findOne({ title });

    const planBenefits = plan
      ? {
          기본: (plan.basicBenefit || []).map((benefit) => ({
            benefit,
            category: '기본',
          })),
          프리미엄: (plan.premiumBenefit || []).map((benefit) => ({
            benefit,
            category: '프리미엄',
          })),
          미디어: (plan.mediaBenefit || []).map((benefit) => ({
            benefit,
            category: '미디어',
          })),
          스마트기기: (plan.smartDevice || []).map((benefit) => ({
            benefit,
            category: '스마트기기',
          })),
          '시그니처/가족결합': (plan.signatureFamilyDiscount || []).map(
            (benefit) => ({
              benefit,
              category: '시그니처/가족결합',
            })
          ),
        }
      : {};

    res.json({
      membershipBenefits,
      longTermBenefits,
      planBenefits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};
