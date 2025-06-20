import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateRandomPlanInfo } from '../utils/helpers.js';

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

export const registerUser = async (req, res) => {
  try {
    const { name, userId, password, isUplus } = req.body;

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 요금제 자동 생성 (isUplus가 true일 경우만)
    let planInfo = null;
    if (isUplus === true || isUplus === 'yes') {
      planInfo = await generateRandomPlanInfo();
    }

    const newUser = new User({
      name,
      userId,
      password: hashedPassword,
      isUplus: isUplus === true || isUplus === 'yes',
      planInfo,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: {
        _id: savedUser._id,
        userId: savedUser.userId,
        name: savedUser.name,
        isUplus: savedUser.isUplus,
        planInfo: savedUser.planInfo,
      },
    });
  } catch (error) {
    console.error('회원가입 실패:', error);
    res.status(500).json({ message: '서버 오류로 회원가입에 실패했습니다.' });
  }
};

export const checkUserIdDuplicate = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId가 필요합니다.' });
    }

    const existingUser = await User.findOne({ userId });

    if (existingUser) {
      return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    return res.status(200).json({ message: '사용 가능한 아이디입니다.' });
  } catch (err) {
    console.error('아이디 중복 확인 실패:', err);
    return res.status(500).json({ message: '서버 오류' });
  }
};
