import React, { lazy, Suspense } from 'react';
import {createContext, useContext,useState,useEffect,useRef,useMemo,useCallback} from 'react'
import Map from 'react-map-gl/mapbox';
import {useStore} from "./useStore";
import 'mapbox-gl/dist/mapbox-gl.css';
import UpdateLayers from './CustomerRenderLayers';

import SidebarVisualizemenu from "./SidebarVisualizeMenu";
import { Slider, Box, Typography } from '@mui/material';
import Discuss from './Discuss';
import FundamentalLayercheck from "./FundamentalLayercheck";
import {initialCheck,mapboxAccessToken,mapstyle,tooltipHandler,marks} from "./Globalvariable";
import { useDiagnosisReceiver } from './useDiagnosisReceiver';
import Stack from '@mui/material/Stack';
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import MouseOver1 from './MouseOver1';
import FileValidated from './FileValidated';
import { useClickareaStore,useLayercheckStore,useBarchartStore,useAreaStore,useWeekdayStore,useKindStore,useTimesliderStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore, useDestStore} from "./useStore";
import FetchTest from './FetchTest';
import SpatialLayercheck from './SpatialLayercheck';
import ChronogicalLayercheck from './ChronogicalLayercheck';
import VisualizationIcon from './visualization.png';
import LosVisualize from './LosVisualize';
import GraphDialog from './GraphDialog';
import styles from "../styles/PopUp.module.css";
import FundamentalVisualize from "./FundamentalVisualize";
import TinyBarChart from "./Barchart";
import AccessibleList from './AccessibilityList';
  //reducer関数を作成
const CustomerTab = () => {
    const receivedSessions = useStore((state) => state.receivedSessions);
  useDiagnosisReceiver(); // リアルタイム受信を有効化
  const isFinishedStep1=useBarchartStore((state)=>state.bar);
  const time=useTimesliderStore((state)=> state.time);
  const area=useAreaStore((state)=> state.area);
  const dest=useDestStore((state)=> state.dest);
  const weekday=useWeekdayStore((state)=> state.weekday);
  const layercheck=useLayercheckStore((state)=> state.layercheck);
  const setlayercheck=useLayercheckStore((state)=> state.selectLayercheck);
  const selectDest=useDestStore((state)=> state.selectDest);
  const selectWeekday=useWeekdayStore((state)=> state.selectWeekday);
  const selectArea=useAreaStore((state)=> state.selectArea);
  const selectKind=useKindStore((state)=> state.selectKind);
  const kind=useKindStore((state)=> state.kind);
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
  const selectdestref = useRef();
  const selectweekdayref = useRef();
  const selectkindref = useRef();
  const selectarearef=useRef();
  const selectlayercheckref=useRef();
  const [sliderLabel, setSliderLabel] = useState("");
  const [destcurrent,setdestcurrent]=useState("未選択");
  const [weekdaycurrent,setweekdaycurrent]=useState("未選択");
  const [layercheckcurrent,setlayercheckcurrent]=useState("未選択");
  const [kindcurrent,setkindcurrent]=useState("未選択");
  const [areacurrent,setareacurrent]=useState("未選択");
  useEffect(() => {
    const h = 11 + parseInt(time * 100000000)
    setSliderLabel(`選択範囲: ${h}:00-${h + 1}:00`)
  }, [time])
  useEffect(() => {
    console.log(dest);
  },[dest]);
  useEffect(() => {
    console.log(weekday);
  },[weekday]);
  useEffect(() => {
    console.log(kind);
  },[kind]);
  useEffect(() => {
    console.log(isFinishedStep1);
  },[isFinishedStep1]);
  const [isPopUpVisible, setPopUpVisible] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = () => {
      console.log("Dialog close event");
      // 「閉じた際に背景要素のスクロールを許可する」といった処理はここで行う
    };

    dialog.addEventListener("close", handleCancel);
    return () => {
      dialog.removeEventListener("close", handleCancel);
    };
  }, []);
  return (
            <div className="clear" style={{ 
                    display: 'flex', 
                    border:'solid',
                    width: '80vw', 
                    height: '80vh', 
                    position: 'relative' // 全体の基準
                  }}>
{receivedSessions.length == 0 && (
      <div>
        <h1>投票されていません</h1>
                  </div>
                    )}
      {receivedSessions.length > 0 && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#ecfdf5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>📥 受信した診断（{receivedSessions.length}件）</h3>
          {receivedSessions.map((session) => (
            <div key={session.sessionId} style={{ padding: '8px', marginBottom: '8px', background: 'white', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                {session.userName} （{new Date(session.receivedAt).toLocaleTimeString('ja-JP')}）
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                ピンポイント性: {session.diagnosis.pointiness}% | 
                冗長性: {session.diagnosis.redundancy}% | 
                ライフスタイル: {session.diagnosis.lifestyle}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
           ) 
}
export default CustomerTab;