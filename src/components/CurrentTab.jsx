import React from 'react';
import {createContext, useContext,useState,useEffect,useRef,useMemo,useCallback} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import UpdateLayers from './AccessibilityRenderLayers';
import Qagrid from "./QA";
import SidebarVisualizemenu from "./SidebarVisualizeMenu";
import TinyBarChart from "./Barchart";
import AccessibleList from './AccessibilityList';
import Discuss from './Discuss';
import FundamentalLayercheck from "./FundamentalLayercheck";
import {initialCheck,mapboxAccessToken,mapstyle,tooltipHandler,marks} from "./Globalvariable";

import SpatialImpact from './SpatialImpact'
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import RenderPoint from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import MouseOver1 from './MouseOver1';
import FileValidated from './FileValidated';
import { useClickareaStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
import FetchTest from './FetchTest';
import AreaSet from './AreaSet';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Jmds from './Jmds';
import 'react-tabs/style/react-tabs.css';
import FundamentalCurrentTab from "./FundamentalCurrentTab";
import LosTab from "./LOSTab";
import CustomerTab from "./CustomerTab";
import DemandTab from "./DemandTab";
import CombinationTab from "./CombinationTab";
import FareTab from "./FareTab";
import FrequencyTab from "./FrequencyTab";
// タブレット幅（狭い画面）かどうかを判定する共有フック
import { useBreakpoint } from "./useBreakpoint";
  //reducer関数を作成
const CurrentTab = () => {
  const tabs = ['サービスレベル(供給)', '満足度', '移動実態(需要)','複合'];
  const contents = [<LosTab/>, <CustomerTab/>, <DemandTab/>, <CombinationTab/>];
  const [activeTab, setActiveTab] = useState(0);
  const { isTablet } = useBreakpoint();
  return (
                <div className="currentfield">
                  <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
                    {tabs.map((tab, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          backgroundColor: activeTab === index ? '#08335c' : 'transparent',
                          color: activeTab === index ? 'white' : 'black', // Ensure text is visible
                          // タブレット幅では固定幅(165px)をやめてflex:1に任せ、はみ出しを防ぐ。
                          // 文字サイズ・paddingも詰めて4タブが1行に収まるようにする。
                          padding: isTablet ? '10px 4px' : '10px 20px',
                          border: '1px solid black',
                          fontSize: isTablet ? '15px' : '25px',
                          cursor: 'pointer',
                          width: isTablet ? 'auto' : '165px',
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* タブコンテンツ */}
                  <div style={{border: 'none'}}>
                    {contents[activeTab]}
                  </div>
                </div>
           ) 
}
export default CurrentTab;