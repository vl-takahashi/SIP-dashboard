import { create } from 'zustand';

/**
 * バス停ネットワークビュー用のZustanドストア
 * 左右パネルの連動状態を管理
 */
export const useBusNetworkStore = create((set) => ({
  // 選択中のルート情報
  selectedRoute: null, // { destination: string, timeSlot: string }

  // 選択中の時間帯
  selectedTimeSlot: '09-18',

  // バス停の情報
  nearestBusStop: null, // { name, lat, lon, walk_time }

  // 到達可能な目的地リスト
  accessibleDestinations: [], // [{ name, timeSlots: ['06-09', '09-18'], travelTime, line }]

  // 各目的地のアクセシビリティスコア
  accessibilityScore: 0, // 0-100

  // マトリックス用データ
  matrix: {}, // { destination: { '06-09': '✅', '09-18': '✅', ... } }

  // アクション
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setNearestBusStop: (stop) => set({ nearestBusStop: stop }),
  setAccessibleDestinations: (destinations) => set({ accessibleDestinations: destinations }),
  setAccessibilityScore: (score) => set({ accessibilityScore: score }),
  setMatrix: (matrix) => set({ matrix }),

  // 両方一緒に更新（データ取得完了時）
  setNetworkData: (data) => set({
    nearestBusStop: data.busStop,
    accessibleDestinations: data.destinations,
    accessibilityScore: data.score,
    matrix: data.matrix,
  }),
}));
