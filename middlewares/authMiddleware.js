import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwt.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
