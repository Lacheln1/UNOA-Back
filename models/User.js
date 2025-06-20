import { Schema, model } from 'mongoose';

const planInfoSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  membership: {
    type: String,
    enum: ['VVIP', 'VIP', '우수'],
    required: true,
  },
  years: {
    type: String,
    enum: ['10년 이상', '5년 이상', '2년 이상', null],
    default: null,
  },
});

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isUplus: { type: Boolean, default: false },
    planInfo: {
      type: planInfoSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model('User', userSchema);
