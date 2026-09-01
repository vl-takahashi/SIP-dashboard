import React,{useState} from 'react'
import {useArealistStore} from "./useStore"
import {vividColors} from "./Globalvariable"

export default function AreaSet() {
  const { value, updateValue } = useArealistStore();
  const [input,setInput]=useState("");
  const handleChange = (e) => {
    setInput(e.target.value); // 入力内容でステートを更新
    updateValue(input);
  };
  return (
    <div className='box'>
        <span><b>地区分け</b></span>
    <form action="" method="POST" onSubmit={(e) => {
        e.preventDefault(); // リロード防止
        }}>
        <input type="text" name="areaset" id="areaset" placeholder="分けたい地区を「,」区切りで列記" size="25" onChange={handleChange}/>
        <p>{value}</p>
        <button onClick={() => updateValue(value)} value="分類">分類</button>
    </form>
    </div>
  )
}
