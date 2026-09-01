import image from "./doctor.png"
import {createContext, useContext,useState,useEffect,useMemo} from 'react'
// サンプルデータ
export default function Qagrid() {
  const [question, setQuestion] = useState("内科に10時に行ける地区の町丁目は?");
  const handleChange = (event) => {
    setQuestion(event.target.value);
  };
  const handleSubmit = (event) => {
    // Prevent the default browser form submission behavior (page reload)
    event.preventDefault(); 
    
    console.log('Form submitted with value:', question);
    // You can add your form submission logic here (e.g., API calls)
  };
  return (
    <fieldset className="fieldset-container" style={{ width: '400px', zIndex: 10 }}>
      <legend className="legend-title">ダッシュボードへの質問</legend>
        
      <form  onSubmit={handleSubmit}>
        <label>質問欄<input type="text" placeholder={question} size="30" onChange={handleChange}/></label>
        <input type="submit" value="送信"></input>

      </form>
      <p>Q.{question}</p>
      <label>A.福富〇丁目は東広島記念病院が最適<br></br>寺家〇丁目は西条中央病院が最適</label>
    </fieldset>
  );
}