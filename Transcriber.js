import { Alert } from 'react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { GOOGLE_API_KEY, GOOGLE_SPEECH_URL } from '@env';

const apiUrl = `${GOOGLE_SPEECH_URL}?key=${GOOGLE_API_KEY}`;

export const transcribeAudio = async (filePath, setTranscript) => {
  console.log("[TRANSCRIBE] 開始處理音訊：", filePath);

  try {
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      Alert.alert('錯誤', '找不到音訊檔案！');
      return null;
    }

    const audioData = await RNFS.readFile(filePath, 'base64');

    const tryTranscribe = async (withChannelCount = true) => {
      const config = {
        encoding: 'FLAC',
        languageCode: 'zh-TW',
      };
      if (withChannelCount) config.audioChannelCount = 2;

      const body = {
        audio: { content: audioData },
        config,
      };

      try {
        return await axios.post(apiUrl, body);
      } catch (error) {
        if (withChannelCount) {
          console.warn("[TRANSCRIBE] 使用 audioChannelCount:2 失敗，重試不加聲道設定...");
          return tryTranscribe(false); // 自動降級重試
        } else {
          throw error;
        }
      }
    };

    const response = await tryTranscribe();
    const results = response.data.results || [];

    const transcriptionText = results.length > 0
      ? results.map(r => r.alternatives[0].transcript).join('\n')
      : '未辨識到任何語音內容';

    setTranscript(transcriptionText);

    const txtFilePath = `${RNFS.DocumentDirectoryPath}/latest_transcription.txt`;
    await RNFS.writeFile(txtFilePath, transcriptionText, 'utf8');
    console.log(`[SAVE] TXT 已儲存至：${txtFilePath}`);

    return transcriptionText;
  } catch (error) {
    const message = JSON.stringify(error.response?.data || error.message, null, 2);
    console.error("[TRANSCRIBE] 錯誤：", message);
    return null;
  }
};