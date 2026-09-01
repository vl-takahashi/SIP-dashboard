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
import AccessibleList from './AccessibleList';
import Discuss from './Discuss';
import FundamentalLayercheck from "./FundamentalLayercheck";
import {initialCheck,INITIAL_VIEW_STATE,mapboxAccessToken,mapstyle,tooltipHandler,marks} from "./Globalvariable";
import { CheckContext,DataContext,MuniContext, LoadContext,ApirouteContext} from './context';
import SpatialImpact from './SpatialImpact'
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import RenderPoint from "./RenderPoint";
import MouseOver1 from './MouseOver1';
import FileValidated from './FileValidated';
import { useClickareaStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
import FetchTest from './FetchTest';
import AreaSet from './AreaSet';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Jmds from './Jmds';
import 'react-tabs/style/react-tabs.css';
import FundamentalAlltab from "./FundamentalAlltab";
import AccessibilityTab from "./AccessibilityTab";
import CustomerTab from "./CustomerTab";
import DemandTab from "./DemandTab";
import FareTab from "./FareTab";
import FrequencyTab from "./FrequencyTab";
  //reducer関数を作成
const DefaultAllTab = () => {
  return (
                <div className="currentfield">
                  <AccessibilityTab/>
                </div>
           ) 
}
export default Alltab;