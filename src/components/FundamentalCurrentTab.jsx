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

import SpatialImpact from './SpatialImpact'
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import MakeMesh from "./MakeMesh";
import MouseOver1 from './MouseOver1';
import FileValidated from './FileValidated';
import { useClickareaStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
import FetchTest from './FetchTest';
import AreaSet from './AreaSet';
import VisualizeDialog from './VisualizeDialog';
import RenderRoute from './RenderRoute';
import FundamentalVisualize from './FundamentalVisualize';
import GraphDialog from './GraphDialog';
  //reducer関数を作成
const FundamentalCurrentTab = () => {
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
  const [volume, setVolume] = useState(-5/100000000);

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
                    <div className="fixed inset-0 pointer-events-none z-50" id ="checkbox" style={{ width: '10%', height:'10%'}}>
                    
                    <FundamentalVisualize/>
                    <GraphDialog/>
                    
                    <Mouseover1/>

                    </div>
                  
                    <div className="fixed inset-0 pointer-events-none z-50" id ="checkbox" style={{ width: '10%', height:'10%'}}>
                      
                      <FundamentalLayercheck checked={check}/>
                      
                    </div>
                  
                    <div className="map"
                            style={{ 
                            flex: 1, 
                            position: 'relative', // 重要：DeckGLの親として必須
                            height: '80vh',
                          }}>
                      <UpdateLayers/>
                          
                    </div>
                  </div>
                </div>
           ) 
}
export default FundamentalCurrentTab;