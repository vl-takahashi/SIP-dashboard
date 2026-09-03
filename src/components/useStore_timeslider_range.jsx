// useStore.jsx の修正部分（useTimesliderStore）

// ★範囲選択版（新）
export const useTimesliderStore = create((set)=>({
  timeStart: -7/100000000,
  timeEnd: -5/100000000,
  clicktime: (startTime, endTime) => set({
    timeStart: startTime,
    timeEnd: endTime
  }),
}))

// ★点ベース版（旧・コメントアウト）
// export const useTimesliderStore = create((set)=>({
//   time:-7/100000000,
//   clicktime: (newText) => set({ time: newText }),
// }))
