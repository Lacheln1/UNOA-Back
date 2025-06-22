import { appDeviceBenefits } from '../data/appDeviceBenefits.js';
import { activityBenefits } from '../data/activityBenefits.js';
import { beautyHealthBenefits } from '../data/beautyHealthBenefits.js';
import { cultureLeisureBenefits } from '../data/cultureLeisureBenefits.js';
import { educationBenefits } from '../data/educationBenefits.js';
import { foodBenefits } from '../data/foodBenefits.js';
import { lifeConvenienceBenefits } from '../data/lifeConvenienceBenefits.js';
import { shoppingBenefits } from '../data/shoppingBenefits.js';
import { travelTransportBenefits } from '../data/travelTransportBenefits.js';

const allBenefits = [
  appDeviceBenefits,
  activityBenefits,
  beautyHealthBenefits,
  cultureLeisureBenefits,
  educationBenefits,
  foodBenefits,
  lifeConvenienceBenefits,
  shoppingBenefits,
  travelTransportBenefits,
];

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const benefitSchema = new mongoose.Schema({
  category: String,
  benefits: [
    {
      id: Number,
      title: String,
      descriptions: [String],
    },
  ],
});

const Benefit = mongoose.model('Benefit', benefitSchema);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await Benefit.deleteMany();
    await Benefit.insertMany(allBenefits);
    console.log('데이터가 성공적으로 저장되었습니다!');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('에러 발생:', err);
  });
