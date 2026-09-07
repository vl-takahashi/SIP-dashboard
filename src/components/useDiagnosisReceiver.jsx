import { useEffect } from 'react';
import { useStore } from './useStore';

export const useDiagnosisReceiver = () => {
  const { addReceivedDiagnosis } = useStore();

  useEffect(() => {
    // 現在は診断結果受信機能は無効化されています
    // チャットボット側から /api/diagnosis に POST された診断結果は
    // Vercel ログに記録されます

    console.log('ℹ️ 診断結果受信機能は現在無効です');
    console.log('📝 診断結果はチャットボット側の転送メッセージで確認できます');

    return () => {};
  }, [addReceivedDiagnosis]);
};