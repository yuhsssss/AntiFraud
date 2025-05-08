import { Alert } from 'react-native';

export function assessFraudRisk(matchRatio) {
  const riskLevel = getRiskLevel(matchRatio);
  showWarning(riskLevel);
}

function getRiskLevel(matchRatio) {
  if (matchRatio > 0.5) {
    return 'high';
  } else if (matchRatio > 0.2) {
    return 'medium';
  } else {
    return 'low';
  }
}

function showWarning(riskLevel) {
  if (riskLevel === 'high') {
    Alert.alert(
      '⚠️ 高風險警告',
      '這通電話疑似為詐騙，請立刻停止通話！',
      [{ text: '了解', style: 'destructive' }]
    );
  } else if (riskLevel === 'medium') {
    Alert.alert(
      '⚠️ 中等風險',
      '這通電話有潛在詐騙風險，請保持警覺。',
      [{ text: '知道了', style: 'default' }]
    );
  }
  else{
  Alert.alert(
        '⚠️ 低風險',
        '這通電話暫無詐騙風險，但請依舊保持警惕。',
        [{ text: '知道了', style: 'default' }]
      );
  }
}
