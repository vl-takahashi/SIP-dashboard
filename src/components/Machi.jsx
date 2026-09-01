import React from 'react';
import {createContext, useContext,useState,useEffect,useMemo} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import {DeckGL} from '@deck.gl/react';
import UpdateLayers from './AccessibilityRenderLayers';
const Machitab = () => {
  let check_array=[];
  let [showLayer, setShowLayer] = useState(check_array);
  // 初期ビューポートの設定
  const INITIAL_VIEW_STATE = {
      longitude: 132.74344,
      latitude: 34.4309131,
      bearing: 0,
      pitch: 0,
      zoom: 12,
  };
  
  let message="machigurumi";
  console.log(message);
  
  
  let checkbox=document.getElementById("checkbox");
  
  const tooltipHandler = (d) => {
    //マウスホバー位置に地物が存在するかチェックする
    if (!d || !d.object) return null;
    let obj = d.object;

    //geojsonレイヤーの場合はpropertiesの値をobjに入れる
    if (d.object.properties) obj = d.object.properties;

    //データからtr要素を生成する
    const trs = Object.keys(obj)
      .filter((key) => obj[key]) //値がnullや""のプロパティは省く
      .map(
        (key) =>
          `<tr><th style="text-align:right">${key}</th><td>${obj[key]}</td></tr>`
      )
      .join("\n");

    //tooltip内に出力するhtml要素を生成する
    const html = ["<table>", trs, "</table>"].join("\n");

    return {
      // tooltip内に出力するhtml要素を渡す
      html: html,
      // tooltip内のhtmlに適用するstyleを設定する
      style: {
        fontSize: "0.5em"
      }
    };
  };
  return (
            <div className="clear" style={{ 
                display: 'flex', 
                border:'solid',
                borderColor:'orange',
                width: '80vw', 
                height: '80vh', 
                position: 'relative' // 全体の基準
              }}>
          <div>
            <h1>交流評価(まちぐるみシミュレーター)</h1>
          </div>
          <div className="map"
                style={{ 
            flex: 1, 
            position: 'relative', // 重要：DeckGLの親として必須
            overflow: 'hidden',    // 内部での重なりを制御
            height: '100%'
          }}>
                {/*<UpdateLayers/>*/}
                
          </div>
        </div>
           ) 
}
export default Machitab;