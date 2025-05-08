import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { compare } from './compare.js';

const app = express();
const port = 4000;

// MongoDB 連接 URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/scam_keywords'
//const MONGO_URI = 'mongodb://localhost:27017/scam_keywords';

// 連接到 MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('成功連接到 MongoDB'))
  .catch((err) => console.error('MongoDB 連接失敗:', err));

// 中介軟體
app.use(bodyParser.json());

// 進行密文比對的路由
app.post('/match', async (req, res) => {
  const inputArray = req.body;
  console.log('收到資料進行比對');

  try {
    // 1. 先自動取得資料庫的 collection 名單
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    console.log('找到 collections:', collectionNames);

    let allScamKeywords = [];

    // 2. 每個 collection 都動態讀取
    for (const name of collectionNames) {
      // 先檢查 Model 是否已存在
      let ScamKeywordModel;
      if (mongoose.models[name]) {
        ScamKeywordModel = mongoose.models[name];
      } else {
        ScamKeywordModel = mongoose.model(
          name,
          new mongoose.Schema({
            keywords: { type: String, required: true },
            ciphertext: {
              U: { type: String, required: true },
              V: { type: String, required: true },
              W: { type: String, required: true },
            },
          }),
          name
        );
      }

      const scamKeywords = await ScamKeywordModel.find();
      allScamKeywords = allScamKeywords.concat(scamKeywords);
    }

    let matchedCount = 0;

    for (const input of inputArray) {
      let isMatched = false;
      for (const scam of allScamKeywords) {
        if (compare(input.ciphertext, scam.ciphertext)) {
          isMatched = true;
          break;
        }
      }
      if (isMatched) matchedCount++;
    }

    const matchRatio = matchedCount / inputArray.length;
    res.json(matchRatio);

  } catch (err) {
    console.error('伺服器錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器啟動於 http://localhost:${port}`);
});



/*
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { compare } from './compare.js';

const app = express();
const port = 4000;

// MongoDB 連接 URI，改連 scam_keywords 資料庫
const MONGO_URI = 'mongodb://localhost:27017/scam_keywords';

// 連接到 MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('成功連接到 MongoDB'))
  .catch((err) => console.error('MongoDB 連接失敗:', err));

// 中介軟體
app.use(bodyParser.json());

// 手動定義可用的 collections 名字
const collectionNames = [
  'finance', 'identity', 'internetelectronics', 'investment', 'misinformation', 'others'
];

// 進行密文比對的路由
app.post('/match', async (req, res) => {
  const inputArray = req.body;
  console.log('收到資料進行比對');

  try {
    let allScamKeywords = [];

    // 把每個 collection 裡的文件都讀出來
    for (const name of collectionNames) {
      const ScamKeywordModel = mongoose.model(
        name, 
        new mongoose.Schema({
          keywords: { type: String, required: true },
          ciphertext: {
            U: { type: String, required: true },
            V: { type: String, required: true },
            W: { type: String, required: true },
          },
        }), 
        name
      );
      const scamKeywords = await ScamKeywordModel.find();
      allScamKeywords = allScamKeywords.concat(scamKeywords);
    }

    let matchedCount = 0;

    for (const input of inputArray) {
      let isMatched = false;
      for (const scam of allScamKeywords) {
        if (compare(input.ciphertext, scam.ciphertext)) {
          isMatched = true;
          break;
        }
      }
      if (isMatched) matchedCount++;
    }

    const matchRatio = matchedCount / inputArray.length;
    res.json(matchRatio);

  } catch (err) {
    console.error('伺服器錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器啟動於 http://localhost:${port}`);
});
*/

/*
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { compare } from './compare.js';  // 引入比對函式
import ScamKeyword from './models/ScamKeyword.js';  // 引入模型

const app = express();
const port = 4000;

// MongoDB 連接 URI
const MONGO_URI = 'mongodb://localhost:27017/encrypted_keywords';  // 確保資料庫名稱正確

// 連接到 MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('成功連接到 MongoDB'))
  .catch((err) => console.error('MongoDB 連接失敗:', err));

// 中介軟體，解析 JSON 請求體
app.use(bodyParser.json());

// 進行密文比對的路由
app.post('/match', async (req, res) => {
  const inputArray = req.body;  // 獲取前端傳送的資料（陣列）

  console.log('收到資料進行比對');  // 用來檢查資料是否正確接收

  try {
    // 從資料庫查找所有的詐騙關鍵字
    const scamKeywords = await ScamKeyword.find();

    let matchedCount = 0;  // 計數匹配成功的關鍵字數量

    // 遍歷每一筆前端傳送的密文資料
    for (const input of inputArray) {
      let isMatched = false;  // 用來標記該關鍵字是否匹配成功
      for (const scam of scamKeywords) {
        // 比對密文
        const match = compare(input.ciphertext, scam.ciphertext);

        if (match) {
          isMatched = true;  // 如果比對成功，設為 true
          break;  // 一旦匹配成功就不需要再比對其他的資料庫關鍵字
        }
      }

      if (isMatched) {
        matchedCount++;  // 如果該關鍵字匹配成功，增加計數
      }
    }

    // 計算匹配的關鍵字比例
    const matchRatio = matchedCount / inputArray.length;
    res.json(matchRatio);

  } catch (err) {
    console.error('伺服器錯誤:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器啟動於 http://localhost:${port}`);
});
*/
