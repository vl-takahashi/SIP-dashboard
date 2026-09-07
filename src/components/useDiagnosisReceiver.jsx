import { useEffect } from 'react';
import { useStore } from './useStore';

export const useDiagnosisReceiver = () => {
  const { addReceivedDiagnosis } = useStore();

  useEffect(() => {
    // チャットボット API URL を取得
    const getChatbotUrl = () => {
      // 環境変数から取得
      const envUrl = import.meta.env.VITE_CHATBOT_URL;
      if (envUrl) {
        console.log('チャットボット URL（環境変数）:', envUrl);
        return envUrl;
      }

      // デフォルト URL
      const defaultUrl = 'https://sip-chatbot-ten.vercel.app';
      console.log('チャットボット URL（デフォルト）:', defaultUrl);
      return defaultUrl;
    };

    const chatbotUrl = getChatbotUrl();
    if (!chatbotUrl) {
      console.warn('⚠️ チャットボット API URL が設定されていません');
      return;
    }

    // HTTP ポーリング（3秒ごと）で診断結果を取得
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${chatbotUrl}/api/diagnosis-list`);
        const result = await response.json();

        if (result.success && result.data?.length > 0) {
          // 最新の診断結果を抽出
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
    console.log(`📍 チャットボット URL: ${chatbotUrl}`);

    return () => clearInterval(pollInterval);
  }, [addReceivedDiagnosis]);
};