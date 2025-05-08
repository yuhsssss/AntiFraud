import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { AZURE_OPENAI_ENDPOINT, API_KEY, DEPLOYMENT_NAME, API_VERSION } from '@env';

export const fetchAIResponse = async (setResponse = () => {}, setLoading = () => {}) => {
    const filePath = `${RNFS.DocumentDirectoryPath}/latest_transcription.txt`;
    let textToAnalyze = '';

    try {
      textToAnalyze = await RNFS.readFile(filePath, 'utf8');
      if (!textToAnalyze.trim()) {
        alert("latest_transcription.txt 是空的！");
        return;
      }
    } catch (err) {
      alert("無法讀取 latest_transcription.txt！");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${AZURE_OPENAI_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
        {
          messages: [
            {
              role: "system",
              content:
                '你是一個專門進行關鍵字提取的 AI。請從使用者給的通話文本中提取多個關鍵字，整理為標準 JSON 格式，並以以下方式輸出：\n\n' +
                '請只輸出：\n\n' +
                '```json\n' +
                '{\n' +
                '  "keywords": ["詐騙", "帳號", "ATM"]\n' +
                '}\n' +
                '```\n\n' +
                '請務必使用 ```json 標記包起來，且只回傳 JSON 區塊，不要多加說明。',
            },
            { role: "user", content: `請從以下文本提取關鍵字：\n\n${textToAnalyze}` },
          ],
          max_tokens: 300,
          temperature: 0.3,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": API_KEY,
          },
        }
      );

      const reply = result.data.choices[0]?.message?.content || "無法解析回應";
      setResponse(reply);

      // 擷取並儲存 JSON
      try {
        const jsonMatch = reply.match(/```json\n([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          const jsonString = jsonMatch[1];
          const parsedJSON = JSON.parse(jsonString);
          const path = `${RNFS.DocumentDirectoryPath}/keywords.json`;
          await RNFS.writeFile(path, JSON.stringify(parsedJSON, null, 2), 'utf8');
          console.log("✅ JSON 已儲存到：", path);
        } else {
          throw new Error("無法找到合法 JSON 區塊");
        }
      } catch (err) {
        console.error("❌ JSON 解析或儲存失敗：", err.message);
      }

    } catch (error) {
      console.error("❌ API 請求失敗：", error.response?.data || error.message);
      console.error("❌ API 請求失敗詳細：", JSON.stringify(error?.response?.data || error.message, null, 2));
      setResponse("API 請求失敗，請檢查 API 連線與 Key 設定！");
    } finally {
      setLoading(false);
    }
  };