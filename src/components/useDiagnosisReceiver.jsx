import { useEffect } from 'react';
import { useStore } from './useStore';

export const useDiagnosisReceiver = () => {
  const { addReceivedDiagnosis } = useStore();

  useEffect(() => {
    // URL パラメータから sessionId を取得
    const getSessionId = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get('sessionId');
    };

    const sessionId = getSessionId();
    if (!sessionId) {
      console.warn('⚠️ sessionId がロードされていません');
      return;
    }

    // ダッシュボード自身の /api/get-diagnosis-list をポーリング
    const dashboardUrl = window.location.origin;

    // HTTP ポーリング（3秒ごと）で診断結果を取得
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${dashboardUrl}/api/get-diagnosis-list?sessionId=${sessionId}`,
          {
            headers: {
              'X-Session-ID': sessionId,
            },
          }
        );
        const result = await response.json();

        if (result.success && result.data?.length > 0) {
          const latestDiagnosis = result.data[0];
          console.log(
            `📥 新しい診断結果を受け取りました: ${latestDiagnosis.userName}`
          );
          addReceivedDiagnosis(latestDiagnosis);
        }
      } catch (error) {
        console.warn('❌ ポーリングエラー:', error.message);
      }
    }, 3000);

    console.log('✅ 診断結果ポーリングを開始しました');
    console.log(`📍 セッション ID: ${sessionId}`);

    return () => clearInterval(pollInterval);
  }, [addReceivedDiagnosis]);
};