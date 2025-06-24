import mongoose from 'mongoose';

const benefitSchema = new mongoose.Schema({
  type: { type: String, enum: ['멤버십', '장기고객'], required: true },
  level: { type: String, required: true },
  brand: { type: String, required: true },
  benefit: { type: String, required: true },
  category: { type: String, required: true },
});

export const Benefit = mongoose.model('Benefit', benefitSchema);
