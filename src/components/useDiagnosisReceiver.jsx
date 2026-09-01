import { useEffect } from 'react';
import { useStore } from './store';

export const useDiagnosisReceiver = () => {
  const { addReceivedDiagnosis } = useStore();

  useEffect(() => {
    // ダッシュボード API URL を取得
    const getDashboardUrl = () => {
      const envUrl = import.meta.env.VITE_DASHBOARD_API_URL;
      if (envUrl) return envUrl;

      const params = new URLSearchParams(window.location.search);
      const facilitator = params.get('facilitator');
      if (facilitator) {
        return facilitator.includes('.vercel.app')
          ? `https://${facilitator}`
          : `http://${facilitator}`;
      }

      return null;
    };

    const url = getDashboardUrl();
    if (!url) {
      console.warn('⚠️ ダッシュボード API URL が設定されていません');
      return;
    }

    // HTTP ポーリング（3秒ごと）で診断結果を取得
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${url}/api/diagnosis-list`);
        const result = await response.json();

        if (result.success && result.data?.length > 0) {
          const latestDiagnosis = result.data[0];
          addReceivedDiagnosis(latestDiagnosis);
        }
      } catch (error) {
        console.warn('❌ ポーリングエラー:', error.message);
      }
    }, 3000);

    console.log('✅ 診断結果ポーリングを開始しました');

    return () => clearInterval(pollInterval);
  }, [addReceivedDiagnosis]);
};