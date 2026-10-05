import { create } from "zustand";

/**
 * チャットボットの Q1/Q2/Q3 回答を管理するストア
 * - Q1: 目的地（dest）
 * - Q2: 緯度経度（latitude, longitude）
 * - Q3: 希望到着時間（arrival_time）
 */
export const useQuestionsStore = create((set) => ({
  // ✅ 最新のデータ（1つ）
  questions: {
    sessionId: null,
    q1_destination: null,
    q2_latitude: null,
    q2_longitude: null,
    q3_arrival_time: null,
    address: null,
    targetDate: null,  // ✅ 回答対象日（YYYY-MM-DD）
  },

  // ✅ 全ての Q1/Q2/Q3 データを管理（複数）
  questionsList: [], // [{sessionId, q1_destination, q2_latitude, q2_longitude, q3_arrival_time, address, timestamp, targetDate}, ...]

  /**
   * Q1/Q2/Q3 データを一括設定
   * API から取得した questionsList を渡すと、questions と questionsList を同時に更新
   * ✅ timestamp を UTC から JST に変換
   */
  setQuestions: (questionsList) =>
    set((state) => {
      // ✅ timestamp を JST に変換する関数
      const convertToJST = (utcString) => {
        if (!utcString) return utcString;
        try {
          const date = new Date(utcString);
          // 9時間足す
          const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

          // JST でフォーマット
          const year = jstDate.getUTCFullYear();
          const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(jstDate.getUTCDate()).padStart(2, '0');
          const hours = String(jstDate.getUTCHours()).padStart(2, '0');
          const minutes = String(jstDate.getUTCMinutes()).padStart(2, '0');
          const seconds = String(jstDate.getUTCSeconds()).padStart(2, '0');
          const ms = String(jstDate.getUTCMilliseconds()).padStart(3, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}+09:00`;
        } catch (e) {
          return utcString;
        }
      };

      // ✅ questionsList の各要素の timestamp を変換
      const convertedList = questionsList?.map((item) => ({
        ...item,
        timestamp: convertToJST(item.timestamp),
      })) || [];

      return {
        questions: convertedList?.[convertedList.length - 1] || state.questions,  // ✅ 最新データ
        questionsList: convertedList,  // ✅ 全データ
      };
    }),

  /**
   * Q1データのみ設定
   */
  setQ1: (q1_dest, address) =>
    set((state) => ({
      questions: {
        ...state.questions,
        q1_destination: q1_dest,
        address,
      },
    })),

  /**
   * Q2データのみ設定
   */
  setQ2: (q2_lat, q2_lon) =>
    set((state) => ({
      questions: {
        ...state.questions,
        q2_latitude: q2_lat,
        q2_longitude: q2_lon,
      },
    })),

  /**
   * Q3データのみ設定
   */
  setQ3: (q3_time) =>
    set((state) => ({
      questions: {
        ...state.questions,
        q3_arrival_time: q3_time,
      },
    })),

  /**
   * データをクリア
   */
  clearQuestions: () =>
    set(() => ({
      questions: {
        sessionId: null,
        q1_destination: null,
        q2_latitude: null,
        q2_longitude: null,
        q3_arrival_time: null,
        address: null,
        targetDate: null,  // ✅ クリア時も targetDate をリセット
      },
    })),

  /**
   * データを取得
   */
  getQuestions: (state) => state.questions,
}));
