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
  const updateQuestionsList = useQuestionsStore((state) => state.setQuestions);
  const updatedQuestionsList = useQuestionsStore((state) => state.questionsList);

  // ✅ ポーリングは CombinationTab.jsx で実装済み（2秒間隔）
  // App.jsx では削除して重複を避ける

  
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
