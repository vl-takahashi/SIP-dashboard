// AccessibilityTab.jsx の修正部分

// ==================== 95行目付近：state定義 ====================

// ★範囲選択版（新）
const timeStart = useTimesliderStore(state => state.timeStart);
const timeEnd = useTimesliderStore(state => state.timeEnd);
const [value, setValue] = useState([timeStart, timeEnd]);

// ★点ベース版（旧・コメントアウト）
// const time = useTimesliderStore(state => state.time)
// const clicktime = useTimesliderStore(state => state.clicktime)
// const [value, setValue] = useState(time);

// ==================== useEffect：外部store同期 ====================

// ★範囲選択版：外部storeの変更を同期
useEffect(() => {
  setValue([timeStart, timeEnd]);
}, [timeStart, timeEnd]);

// ==================== 180-182行目：useEffect修正 ====================

// ★範囲選択版（新）
useEffect(() => {
  const startH = Math.floor(value[0] * 100000000) + 11;
  const endH = Math.floor(value[1] * 100000000) + 11;
  setSliderLabel(`選択範囲: ${startH}:00-${endH}:00`);
}, [value])

// ★点ベース版（旧・コメントアウト）
// useEffect(() => {
//   const h = 11 + parseInt(time * 100000000)
//   setSliderLabel(`選択範囲: ${h}:00-${h + 1}:00`)
// }, [time])

// ==================== 644-654行目：Slider実装 ====================

// ★範囲選択版（新）
<Slider
  step={0.00000001}
  marks={marks}
  track={true}  // 範囲を視覚的に表示
  min={-0.00000007}
  max={0.00000013}
  value={value}  // [start, end]配列
  onChange={(e, newValue) => {
    setValue(newValue);
  }}
  onChangeCommitted={(e, newValue) => {
    const clicktime = useTimesliderStore.getState().clicktime;
    clicktime(newValue[0], newValue[1]);  // 両方を送信
  }}
  aria-label="Time Range"
  ref={volumeRef}
/>

{/* 選択範囲表示 */}
<p style={{fontSize:'13px', marginTop:'8px'}}>
  {Math.floor(value[0] * 100000000) + 11}:00 ～ {Math.floor(value[1] * 100000000) + 11}:00
</p>

{/* ★点ベース版（旧・コメントアウト）
<Slider
  step={0.00000001}
  marks={marks}
  track={false}
  min={-0.00000007}
  max={0.00000013}
  value={time}
  onChangeCommitted={(e, newValue) => {
    clicktime(newValue);
  }}
  aria-label="Volume"
  ref={volumeRef}
/>
*/}

<div>
  <p style={{fontSize:'13px'}}>地図データ © Google</p>
</div>
