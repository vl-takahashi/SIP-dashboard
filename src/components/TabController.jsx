import { createContext, useState,useReducer } from "react";
import CurrentTab from "./CurrentTab";
import Futuretab from "./Future";
import Lipttab from "./Lipt";
import Machitab from "./Machi";
import Dtsbtab from "./Dtsb";
import React from 'react';
import doctor from "./doctor.png"
import UpdateLayers from './AccessibilityRenderLayers';
let data=[
{property:"point",name: '西条駅', lng: 132.74344, lat: 34.4309131},
{property:"point",name: '西条駅', lng: 132.7436196, lat: 34.4306688},
{property:"point",name: '西条駅', lng: 132.743331, lat: 34.4306205},
{property:"point",name: '西条駅', lng: 132.7434365, lat: 34.4309115},
{property:"point",name: '西条駅', lng: 132.7432744, lat: 34.4308846},
{property:"point",name: '西条駅', lng: 132.7433269, lat: 34.4306239},
{property:"point",name: '西条駅', lng: 132.7435893, lat: 34.4309336},
{property:"point",name: '西条駅', lng: 132.7431963, lat: 34.4305883},
{property:"point",name: '西条駅', lng: 132.7431648, lat: 34.4306133},
{property:"point",name: '中央公園前', lng: 132.743111, lat: 34.4282682}]
const Tabcontroller = () => {
  const [activeTab, setActiveTab] = useState("current");

  const [isload,setLoad]=useState(false);
  const [ muni, setMuni ] = useState("");
  // 引数のtabにrecommendation、もしくはfollowを入れることでstate関数によりタブを切り替える
  const [currentToggled, setcurrentToggled] = useState("current");
  const [futureToggled, setfutureToggled] = useState(true);
  const [liptToggled, setliptToggled] = useState(true);
  const [machiToggled, setmachiToggled] = useState(true);
  const [dtsbToggled, setdtsbToggled] = useState(true);
  function currenttab(){
    setActiveTab("current");
    setcurrentToggled("current");
    setfutureToggled(true);
    setliptToggled(true);
    setdtsbToggled(true);
    setmachiToggled(true);
  }
  function futuretab(){
    setActiveTab("future");
    setcurrentToggled(true);
    setfutureToggled("future");
    setliptToggled(true);
    setdtsbToggled(true);
    setmachiToggled(true);
  }
  function lipttab(){
    setActiveTab("lipt");
    setcurrentToggled(true);
    setfutureToggled(true);
    setliptToggled("lipt");
    setdtsbToggled(true);
    setmachiToggled(true);
  }
  function machitab(){
    setActiveTab("machi");
    setcurrentToggled(true);
    setfutureToggled(true);
    setliptToggled(true);
    setdtsbToggled(true);
    setmachiToggled("machi");
  }
  function dtsbtab(){
    setActiveTab("dtsb");
    setcurrentToggled(true);
    setfutureToggled(true);
    setliptToggled(true);
    setdtsbToggled("dtsb");
    setmachiToggled(true);
  }
  return (
    <div style={{ display: 'flex', height: '100%' }}>
  
  {/* 縦タブ */}
  <div className="tabs" style={{ display: 'flex', flexDirection: 'column', width: '165px' }}>
    <div className="tab-item">
      <button
        className={`tab ${activeTab === "current" ? "active" : ""}`}
        style={{
          textAlign: 'left',
          backgroundColor: currentToggled !== "current" ? 'transparent' : '#08335c',
          color: currentToggled !== "current" ? 'black' : 'white',
          padding: '10px 20px',
          border: 'none',
          fontSize: '25px',
          cursor: 'pointer',
          width: '165px',
        }}
        onClick={() => currenttab(activeTab)}
      >
        <img src={doctor} style={{ width: '20%', height: '20%' }} />現状診断
      </button>
    </div>

    <div className="tab-item">
      <button
        className={`tab ${activeTab === "future" ? "active" : ""}`}
        style={{
          textAlign: 'left',
          backgroundColor: futureToggled !== "future" ? 'transparent' : '#08335c',
          color: futureToggled !== "future" ? 'black' : 'white',
          padding: '10px 20px',
          border: 'none',
          fontSize: '25px',
          cursor: 'pointer',
          width: '165px',
        }}
        onClick={() => futuretab(activeTab)}
      >
        趨勢診断
      </button>
    </div>

    <div className="tab-item">
      <button
        className={`tab ${activeTab === "machi" ? "active" : ""}`}
        style={{
          textAlign: 'left',
          backgroundColor: machiToggled !== "machi" ? 'transparent' : '#08335c',
          color: machiToggled !== "machi" ? 'black' : 'white',
          padding: '10px 20px',
          border: 'none',
          fontSize: '25px',
          cursor: 'pointer',
          width: '165px',
        }}
        onClick={() => machitab(activeTab)}
      >
        まちぐるみ<br />シミュレーター
      </button>
    </div>

    <div className="tab-item">
      <button
        className={`tab ${activeTab === "dtsb" ? "active" : ""}`}
        style={{
          textAlign: 'left',
          backgroundColor: dtsbToggled !== "dtsb" ? 'transparent' : '#08335c',
          color: dtsbToggled !== "dtsb" ? 'black' : 'white',
          padding: '10px 20px',
          border: 'none',
          fontSize: '25px',
          cursor: 'pointer',
          width: '165px',
        }}
        onClick={() => dtsbtab(activeTab)}
      >
        M-DTSB
      </button>
      
    </div>
  </div>

  {/* コンテンツ */}
  <div style={{ flex: 1 }}>
    {activeTab === "current" && <CurrentTab />}
    {activeTab === "future" && <Futuretab />}
    {activeTab === "machi" && <Machitab />}
    {activeTab === "dtsb" && <Dtsbtab />}
  </div>

</div>
  );
};

export default Tabcontroller;