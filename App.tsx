import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import SAF from 'react-native-saf-x';
import { transcribeAudio } from './Transcriber';
import { fetchAIResponse } from './FetchKeywords';
import { encrypt } from './encrypt';
import axios from 'axios';
import { assessFraudRisk } from './FraudRisk';
import {
  Button,
  Card,
  Text,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [ciphertextJson, setCiphertextJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [latestAacPath, setLatestAacPath] = useState('');
  const [lastHandledFile, setLastHandledFile] = useState(null);
  const [fixedFolderPath, setFixedFolderPath] = useState('');

  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
      } else {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    }
  }

  const handleSelectFolder = async () => {
    try {
      const folderDetail = await SAF.openDocumentTree(true);
      if (!folderDetail) {
        Alert.alert('⚠️ 未選擇資料夾');
        return;
      }
      console.log('[SAF] 選擇的資料夾：', folderDetail);
      setFixedFolderPath(folderDetail.uri);
      Alert.alert('✅ 成功選擇資料夾', folderDetail.name);
    } catch (error) {
      console.error('[SAF] openDocumentTree 錯誤:', error);
      Alert.alert('❌ 錯誤', '選擇資料夾失敗');
    }
  };

  async function findLatestAacFileSAF(folderUri) {
    try {
      const files = await SAF.listFiles(folderUri);
      const aacFiles = files
        .filter(f => f.name.toLowerCase().endsWith('.aac'))
        .sort((a, b) => (a.name > b.name ? -1 : 1));
      if (aacFiles.length === 0) {
        console.log('[SAF] 沒有找到 AAC 檔案');
        return null;
      }
      const latest = aacFiles[0];
      const fullUri = latest.uri;
      console.log('[SAF] 找到最新 AAC：', fullUri);
      return fullUri;
    } catch (error) {
      console.error('[SAF] 讀取資料夾失敗:', error);
      return null;
    }
  }

  const handleFullProcess = async (aacUriFromWatcher = null) => {
    setLoading(true);
    setBusy(true);
    try {
      await requestStoragePermission();

      const aacUri = aacUriFromWatcher || await findLatestAacFileSAF(fixedFolderPath);
      if (!aacUri) throw new Error("找不到 AAC 檔案");

      setLatestAacPath(aacUri);

      const fileContent = await SAF.readFile(aacUri, { encoding: 'base64' });

      const response = await fetch('https://hpieshop.ntou.edu.tw/convert/convert-aac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aacBase64: fileContent }),
      });

      if (!response.ok) throw new Error("AAC轉FLAC失敗");
      const result = await response.json();

      const flacPath = '/data/data/com.antifraud/files/record.flac';
      await RNFS.writeFile(flacPath, result.flacBase64, 'base64');
      console.log("[流程] ✅ FLAC 儲存完成");

      console.log("[流程] 2️⃣ 語音轉文字");
      const transcribeResult = await transcribeAudio(flacPath, setTranscript);
      if (!transcribeResult) throw new Error("語音轉文字失敗");

      console.log("[流程] 3️⃣ 呼叫 AI 取得關鍵字");
      await fetchAIResponse(async (responseText) => {
        let keywordsArray = [];
        try {
          const match = responseText.match(/```json\n([\s\S]*?)```/);
          if (match && match[1]) {
            const parsed = JSON.parse(match[1]);
            keywordsArray = parsed.keywords || [];
            setKeywords(keywordsArray);
          } else {
            throw new Error("AI 未正確回傳 JSON");
          }
        } catch (e) {
          console.error("❌ JSON 解析失敗：", e);
          setKeywords([]);
          throw e;
        }

        console.log("[流程] 4️⃣ 加密關鍵字 JSON");
        const ciphertexts = keywordsArray.map((kw) => encrypt(kw));
        const outputText = JSON.stringify(ciphertexts, null, 2);
        const outputPath = '/data/user/0/com.antifraud/files/keywords_ciphertext.json';
        await RNFS.writeFile(outputPath, outputText, 'utf8');
        setCiphertextJson(outputText);

        console.log("[流程] 5️⃣ 發送加密後關鍵字");
        const matchResponse = await axios.post('https://hpieshop.ntou.edu.tw/server/match', ciphertexts);
        console.log("[SEND] 回應：", matchResponse.data);
        assessFraudRisk(matchResponse.data);
      }, setLoading);
    } catch (err) {
      console.error("[流程] ❌ 發生錯誤：", err);
      Alert.alert('❌ 錯誤', err.message || '流程失敗');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        await requestStoragePermission();
      } catch (err) {
        console.error("[INIT] 初始化失敗：", err);
      }
    }
    init();

    const interval = setInterval(async () => {
      if (!isMounted || loading || busy || !fixedFolderPath) return;
      try {
        const aacUri = await findLatestAacFileSAF(fixedFolderPath);
        if (aacUri && aacUri !== lastHandledFile) {
          console.log("[WATCHER] 偵測到新 AAC：", aacUri);
          setLastHandledFile(aacUri);
          handleFullProcess(aacUri);
        }
      } catch (err) {
        console.error("[WATCHER] 偵測錯誤：", err);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loading, busy, lastHandledFile, fixedFolderPath]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={{ marginBottom: 16 }}>
        <Card.Title title="📂 選擇通話錄音資料夾" />
        <Card.Content>
          <Button mode="contained" onPress={handleSelectFolder}>
            選擇資料夾
          </Button>
        </Card.Content>
      </Card>

      {loading && <ActivityIndicator animating={true} color="#6200ee" />}

      <Card mode="outlined" style={{ marginVertical: 10 }}>
        <Card.Title title="📁 資料夾路徑" />
        <Card.Content>
          <Text>{fixedFolderPath || '尚未選擇'}</Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium">🔑 關鍵字</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
        {keywords.map((kw, idx) => (
          <Chip key={idx} style={{ margin: 4 }}>{kw}</Chip>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
