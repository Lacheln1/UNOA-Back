import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateRandomPlanInfo } from '../utils/helpers.js';
import { secretKey, tokenLife, cookieOptions } from '../config/jwt.js';

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

export const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // 1. 사용자 존재 여부 확인
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    }

    // 2. 비밀번호 일치 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 3. JWT 생성
    const payload = { id: user._id, userId: user.userId };
    const token = jwt.sign(payload, secretKey, {
      expiresIn: tokenLife,
    });

    // 4. 쿠키에 JWT 저장
    res.cookie('access_token', token, cookieOptions).status(200).json({
      message: '로그인 성공',
    });
  } catch (err) {
    console.error('로그인 중 에러:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
