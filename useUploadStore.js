import { create } from 'zustand';

/**
 * ファイルアップロードデータを管理するZustandストア
 * AccessibilityTab でアップロード → AreaTab で使用
 */
export const useUploadStore = create((set) => ({
  // アップロードされたデータ
  popmeshData: null,
  ridingtimeDataArray: [],

  // データ設定関数
  setPopmeshData: (data) => set({ popmeshData: data }),
  setRidingtimeDataArray: (dataArray) => set({ ridingtimeDataArray: dataArray }),

  // データ追加関数（複数ファイル対応）
  addRidingtimeData: (data) => set((state) => ({
    ridingtimeDataArray: [...state.ridingtimeDataArray, data],
  })),

  // すべてリセット
  clearAll: () => set({
    popmeshData: null,
    ridingtimeDataArray: [],
  }),
}));
