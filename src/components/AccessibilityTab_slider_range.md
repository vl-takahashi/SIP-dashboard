# AccessibilityTab.jsx - タイムスライダー範囲選択対応

## 95行目：state修正

```javascript
// 現在
const [value, setValue] = useState(time);

// 修正（範囲選択対応）
const [value, setValue] = useState([5, 7]);  // 5:00-7:00の初期値
```

## 644-654行目：Slider修正

```javascript
<Slider
  step={0.00000001}
  marks={marks}
  track={true}  // 範囲表示用（falseから変更）
  min={-0.00000007}
  max={0.00000013}
  value={value}  // [min, max]形式
  onChange={(e, newValue) => {
    setValue(newValue);  // 範囲を更新
  }}
  onChangeCommitted={(e, newValue) => {
    clicktime(newValue[0]);  // 開始時刻を送信（または中央値など）
  }}
  aria-label="Time Range"
  ref={volumeRef}
/>

{/* 選択範囲表示 */}
<p style={{fontSize:'13px'}}>
  {Math.floor(value[0])}:00 ～ {Math.floor(value[1])}:00
</p>
```

## 180-182行目：useEffect修正

```javascript
// 現在
useEffect(() => {
  const h = 11 + parseInt(time * 100000000)
  setSliderLabel(`選択範囲: ${h}:00-${h + 1}:00`)
}, [time])

// 修正
useEffect(() => {
  const startH = Math.floor(value[0]) + 11;
  const endH = Math.floor(value[1]) + 11;
  setSliderLabel(`選択範囲: ${startH}:00-${endH}:00`);
}, [value])
```

これでタイムスライダーが範囲選択に対応します。
