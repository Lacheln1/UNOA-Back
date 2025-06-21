import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwt.js';
import { User } from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
