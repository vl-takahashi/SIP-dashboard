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
    sessionId: null,          // セッションID
    q1_destination: null,     // Q1: 目的地
    q2_latitude: null,        // Q2: 緯度
    q2_longitude: null,       // Q2: 経度
    q3_arrival_time: null,    // Q3: 希望到着時間（時間コード）
    address: null,            // Q1で入力した住所
  },

  // ✅ 全ての Q1/Q2/Q3 データを管理（複数）
  questionsList: [], // [{sessionId, q1_destination, q2_latitude, q2_longitude, q3_arrival_time, address, timestamp}, ...]

  /**
   * Q1/Q2/Q3 データを一括設定 + リストに追加
   */
  setQuestions: (sessionId, q1_dest, q2_lat, q2_lon, q3_time, address) =>
    set((state) => {
      const newQuestion = {
        sessionId,
        q1_destination: q1_dest,
        q2_latitude: q2_lat,
        q2_longitude: q2_lon,
        q3_arrival_time: q3_time,
        address,
        timestamp: new Date().toISOString(),
      };

      return {
        questions: newQuestion, // 最新データ
        questionsList: [...state.questionsList, newQuestion], // 全データ
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
      },
    })),

  /**
   * データを取得
   */
  getQuestions: (state) => state.questions,
}));
