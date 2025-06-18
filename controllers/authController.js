import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);

export const registerUser = async (req, res) => {
  try {
    const { name, userId, password, isUplus, planInfo } = req.body;

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      userId,
      password: hashedPassword,
      isUplus,
      planInfo: isUplus ? planInfo : null,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      user: {
        _id: savedUser._id,
        userId: savedUser.userId,
        name: savedUser.name,
        isUplus: savedUser.isUplus,
        planInfo: savedUser.planInfo,
      },
    });
  } catch (error) {
    console.error("회원가입 실패:", error);
    res.status(500).json({ message: "서버 오류로 회원가입에 실패했습니다." });
  }
};
