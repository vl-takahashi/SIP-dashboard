import {createContext, useContext,useState,useEffect} from 'react'
import React from 'react'
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
//import "./index.css";
import {DeckGL} from '@deck.gl/react';
import LiptRender from "./components/LiptRender";
import Tabcontroller from "./components/TabController";
import Jmds from "./components/Jmds";
import Header from './components/Header';
import Footercomponent from './components/footer';
import "./App.css";
function App() {
  const [activeTab, setActiveTab] = useState('default');

  
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
