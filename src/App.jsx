import {createContext, useContext,useState,useEffect} from 'react'
import React from 'react'
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
//import "./index.css";
import LiptRender from "./components/LiptRender";
import Tabcontroller from "./components/TabController";
import Jmds from "./components/Jmds";
import Header from './components/Header';
import Footercomponent from './components/Footer';
import "./App.css";
import { useQuestionsStore } from './components/useQuestionsStore';

function App() {
  const [activeTab, setActiveTab] = useState('default');

  // ✅ 📌 Q1/Q2/Q3 データを取得・更新（sessionId が変わるたびに）
  useEffect(() => {
    const fetchQuestionsData = async () => {
      try {
        // URL クエリから sessionId を取得
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('sessionId');

        if (!sessionId) {
          console.warn('⚠️ sessionId が URL に含まれていません');
          return;
        }

        console.log(`🔄 【App.jsx】Q1/Q2/Q3 データを取得中... sessionId=${sessionId}`);

        // ✅ ダッシュボード API から GET
        const response = await fetch(`/api/questions?sessionId=${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        console.log('✅ 【App.jsx】Q1/Q2/Q3 データを取得しました:', {
          q1: data.q1_destination,
          q2: `${data.q2_latitude}, ${data.q2_longitude}`,
          q3: data.q3_arrival_time,
        });

        // ✅ useQuestionsStore に設定
        const { questionsList,setQuestions } = useQuestionsStore.getState();
        setQuestions(
          data.sessionId,
          data.q1_destination,
          data.q2_latitude,      // 🔴 座標：緯度
          data.q2_longitude,     // 🔴 座標：経度
          data.q3_arrival_time,
          data.address
        );

        console.log(questionsList);
      } catch (error) {
        console.error('❌ 【App.jsx】Q1/Q2/Q3 データ取得エラー:', error.message);
      }
    };

    // 定期的に API を呼び出し（10秒ごと）
    fetchQuestionsData(); // 初回すぐに実行
    const interval = setInterval(fetchQuestionsData, 10000);

    // クリーンアップ
    return () => clearInterval(interval);
  }, []);

  
  function handleMuni(e) {
      setMuni(e.target.value);
    }
  function handleSubmit(e) {
      e.preventDefault();
      setLoad(true);
    }
    return (
      
      <div className="parent">
        <Header/>
        <div className="tab">
          <Tabcontroller/>
        </div>
        <Footercomponent/>
      </div>
    )
  }
export default App
