import { User } from '../models/User.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { secretKey, tokenLife, cookieOptions } from '../config/jwt.js';
import { kakaoConfig } from '../config/oauth.js';
import { generateRandomPlanInfo } from '../utils/helpers.js';

export const kakaoLogin = (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoConfig.clientID}&redirect_uri=${kakaoConfig.callbackURI}&response_type=code`;

  res.redirect(kakaoAuthURL);
};

export const kakaoCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', kakaoConfig.clientID);
    params.append('client_secret', kakaoConfig.clientSecret);
    params.append('redirect_uri', kakaoConfig.callbackURI);
    params.append('code', code);

    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: kakaoId, kakao_account } = userResponse.data;
    const name = kakao_account?.profile?.nickname;

    if (!name)
      return res
        .status(400)
        .json({ message: '사용자 이름을 가져올 수 없습니다.' });

    let user = await User.findOne({ kakaoId });

    if (!user) {
      const tempToken = jwt.sign({ kakaoId, name }, secretKey, {
        expiresIn: '10m',
      });
      const redirectURL = process.env.FRONTEND_URL || 'http://localhost:5173';

      return res.redirect(`${redirectURL}/kakao-extra-info?token=${tempToken}`);
    }

    const token = jwt.sign({ id: user._id, name: user.name }, secretKey, {
      expiresIn: tokenLife,
    });

    const redirectURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res
      .cookie('access_token', token, cookieOptions)
      .redirect(`${redirectURL}/chatbot`);
  } catch (err) {
    console.error('사용자 정보 요청 실패:', err.response?.data || err.message);
    res
      .status(500)
      .json({ message: '카카오 로그인 처리 중 오류가 발생했습니다.' });
  }
};

export const completeKakaoSignup = async (req, res) => {
  const { token, isUplus } = req.body;

  try {
    const payload = jwt.verify(token, secretKey);
    const { kakaoId, name } = payload;

    if (!['yes', 'no'].includes(isUplus)) {
      return res
        .status(400)
        .json({ message: 'isUplus 값이 유효하지 않습니다.' });
    }

    const existing = await User.findOne({ kakaoId });
    if (existing) {
      return res.status(409).json({ message: '이미 가입된 사용자입니다.' });
    }

    let planInfo = null;
    if (isUplus === true || isUplus === 'yes') {
      planInfo = await generateRandomPlanInfo();
    }

    const newUser = new User({
      kakaoId,
      name,
      provider: 'kakao',
      isUplus: isUplus === true || isUplus === 'yes',
      planInfo,
    });

    await newUser.save();

    const finalToken = jwt.sign({ id: newUser._id, name }, secretKey, {
      expiresIn: tokenLife,
    });

    res
      .cookie('access_token', finalToken, cookieOptions)
      .status(201)
      .json({ message: '가입 완료' });
  } catch (err) {
    console.error('[카카오 추가가입 오류]', err);
    res.status(400).json({ message: '토큰이 만료되었거나 유효하지 않습니다.' });
  }
};
