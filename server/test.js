import axios from 'axios';
import fs from 'fs';

// 讀取本地的 JSON 檔案
const filePath = './詐騙通話1_keywords_ciphertext.json';  // 檔案路徑

// 讀取檔案並解析成 JSON
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('無法讀取檔案:', err);
    return;
  }

  // 將檔案內容解析為 JSON
  const jsonData = JSON.parse(data);

  // 使用 axios 發送 POST 請求到伺服器
  axios.post('https://hpieshop.ntou.edu.tw/server/match', jsonData)
    .then(response => {
      console.log('伺服器回應:', response.data);
    })
    .catch(error => {
      console.error('錯誤:', error);
    });
});
