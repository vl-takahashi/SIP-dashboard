import React from 'react';
import {createContext, useContext,useState,useEffect,useRef,useMemo,useCallback} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import UpdateLayers from './AccessibilityRenderLayers';

import SidebarVisualizemenu from "./SidebarVisualizeMenu";

import TinyBarChart from "./Barchart";
import AccessibleList from './AccessibilityList';
import Discuss from './Discuss';
import FundamentalLayercheck from "./FundamentalLayercheck";
import {initialCheck,mapboxAccessToken,mapstyle,tooltipHandler,marks} from "./Globalvariable";

import FareImpact from './FareImpact'
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import MouseOver1 from './MouseOver1';
import FileValidated from './FileValidated';
import { useClickareaStore,useWeekdayStore,useTimesliderStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore, useDestStore} from "./useStore";
import FetchTest from './FetchTest';
import SpatialLayercheck from './SpatialLayercheck';
import ChronogicalLayercheck from './ChronogicalLayercheck';
  //reducer関数を作成
const FareTab = () => {
  const time=useTimesliderStore((state)=> state.time);
  const dest=useDestStore((state)=> state.dest);
  const weekday=useWeekdayStore((state)=> state.weekday);
  const selectDest=useDestStore((state)=> state.selectDest);
  const clicktime=useTimesliderStore((state)=> state.setTime);
  const clickareaaddress = useClickareaStore((state) => state.clickareaaddress);
  const clickareapop = useClickareaStore((state) => state.clickareapop);
  const clickareahousehold = useClickareaStore((state) => state.clickareahousehold);
  const clickareapopdensity = useClickareaStore((state) => state.clickareapopdensity);
  const clickneareststop=useClickneareststopStore((state) => state.clickneareststop);
  const clickstop=useClickstopStore((state) => state.clickstop);
  const clicknearestbusline=useClicknearestbuslineStore((state) => state.clicknearestbusline);
  const clicknearestridetime=useClicknearestridetimeStore((state) => state.clicknearestridetime);
  const clicknearestgetofftime=useClicknearestgetofftimeStore((state) => state.clicknearestgetofftime);
  const [check,setLayerchecked] = useState(initialCheck);
  const volumeRef=useRef();
  const [value, setValue] = useState(time);

  useEffect(() => {
    console.log(time);
    console.log(parseInt(time*100000000));
    volumeRef.current.value="選択範囲:"+String(10+parseInt(time*100000000))+":00-"+String(11+parseInt(time*100000000))+":00";
  },[time]);
  useEffect(() => {
    console.log(dest);
  },[dest]);
  useEffect(() => {
    console.log(weekday);
  },[weekday]);
  return (
<div className="clear" style={{ 
                    display: 'flex', 
                    border:'solid',
                    
                    width: '80vw', 
                    height: '80vh', 
                    position: 'relative' // 全体の基準
                  }}>

                  <div className="field">
                    {/*<Fetch_test/>*/}
                    <div className="visualize" id ="checkbox" style={{ width: '15%', zIndex: 10,textAlign:"left"}}>
                    <Fare_impact/>
                    <hr></hr>
                    <Mouseover1/>

                    </div>
                  
                    <div className="checkbox" id ="checkbox" style={{ width: '15%', zIndex: 10,textAlign:"left"}}>
                      <SpatialLayercheck checked={check}/>
                      
                      <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
                        <Slider 
                          step={0.00000001}
                          marks={marks}
                          track={false}
                          min={-0.00000005}
                          max={0.00000013}
                          aria-label="Volume"  ref={volumeRef}  defaultValue={time} onChange={(e)=>{e.preventDefault;clicktime(e.target.value);}} />
                      </Stack>
                    </div>
                  
                    <div className="map"
                            style={{ 
                            flex: 1, 
                            position: 'relative', // 重要：DeckGLの親として必須
                            height: '80vh',
                          }}>
                      <UpdateLayers/>
                          
                    </div>
                    <div>
                      <div className="radar"style={{ width: '20vw', height:"40vh", zIndex: 10 }}>
                        <Accessiblelist style={{ width: '80%' }}/>
                      </div>
                      <div className="bar"style={{ width: '20vw', height:"40vh",zIndex: 10 }}>
                        <TinyBarChart style={{ width: '80%' }}/>
                      </div>
                    </div>
                  </div>
                </div>
           ) 
}
export default FareTab;