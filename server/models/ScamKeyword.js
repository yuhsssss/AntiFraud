import mongoose from 'mongoose';

// 定義 "keywords_compared" 集合的結構
const scamKeywordSchema = new mongoose.Schema({
  keywords: { type: String, required: true },
  ciphertext: {
    U: { type: String, required: true },
    V: { type: String, required: true },
    W: { type: String, required: true },
  },
});

// 創建並導出模型，與 "keywords_compared" 集合進行綁定
const ScamKeyword = mongoose.model('ScamKeyword', scamKeywordSchema, 'keywords_compared');

export default ScamKeyword;
