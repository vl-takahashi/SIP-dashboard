import image from "./doctor.png"
// サンプルデータ
const rows = [
  { id: 1, name: '田中 太郎', email: 'tanaka@example.com', role: 'Admin' },
  { id: 2, name: '佐藤 花子', email: 'sato@example.com', role: 'User' },
  { id: 3, name: '鈴木 一郎', email: 'suzuki@example.com', role: 'Editor' },
];
export default function Discuss() {
  return (
    <fieldset className="fieldset-disscuss-container" style={{ width: '400px', zIndex: 10 }}>
      <legend className="legend-disscuss-title">コメントかWS文字起こし</legend>
        
      <input type="text" placeholder="自由にどうぞ" size="30"/>
      <br></br>
      <label>福富地区のAさん：耳鼻科は？</label>
    </fieldset>
  );
}