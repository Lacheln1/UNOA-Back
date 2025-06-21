import { User } from '../models/User.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { secretKey, tokenLife, cookieOptions } from '../config/jwt.js';
import { kakaoConfig } from '../config/oauth.js';

export const kakaoLogin = (req, res) => {
  console.log('kakaoConfig:', kakaoConfig);
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoConfig.clientID}&redirect_uri=${kakaoConfig.callbackURI}&response_type=code`;

  console.log('kakaoAuthURL:', kakaoAuthURL);
  res.redirect(kakaoAuthURL);
};

export const kakaoCallback = async (req, res) => {
  const { code } = req.query;
  console.log('인증 코드:', code);

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

    console.log('토큰 응답:', tokenResponse.data);
    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('사용자 정보:', userResponse.data);
    const {
      id: kakaoId,
      properties: { nickname },
      kakao_account: { name: kakaoName },
    } = userResponse.data;
    const name = kakaoName || nickname;

    if (!name)
      return res
        .status(400)
        .json({ message: '사용자 이름을 가져올 수 없습니다.' });

    let user = await User.findOne({ kakaoId });

    if (!user) {
      user = new User({
        kakaoId,
        name,
        provider: 'kakao',
      });

      await user.save();
      console.log('새 사용자 생성 완료:', user);
    } else {
      console.log('기존 사용자 로그인:', user);
    }

    const token = jwt.sign({ id: user._id, name: user.name }, secretKey, {
      expiresIn: tokenLife,
    });

    const redirectURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res
      .cookie('access_token', token, cookieOptions)
      .redirect(`${redirectURL}/`);
  } catch (err) {
    console.error('사용자 정보 요청 실패:', err.response?.data || err.message);
    res
      .status(500)
      .json({ message: '카카오 로그인 처리 중 오류가 발생했습니다.' });
  }
};
