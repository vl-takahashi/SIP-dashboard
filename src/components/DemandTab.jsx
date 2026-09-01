import React, { lazy, Suspense } from 'react';
import {createContext, useContext,useState,useEffect,useRef,useMemo,useCallback} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import DemandRenderLayers from './DemandRenderLayers';

import SidebarVisualizemenu from "./SidebarVisualizeMenu";
import { Slider, Box, Typography } from '@mui/material';
import Discuss from './Discuss';
import ODLayercheck from "./ODLayercheck";
import ExistedData from './ExistedData';
import {initialCheck,mapboxAccessToken,mapstyle,tooltipHandler,marks} from "./Globalvariable";

import Stack from '@mui/material/Stack';
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import MouseOver1 from './MouseOver1';
import FileValidated from './FileValidated';
import { useClickareaStore,useLayercheckStore,useBarchartStore,useAreaStore,useWeekdayStore,useKindStore,useTimesliderStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore, useDestStore} from "./useStore";
import FetchTest from './FetchTest';
import ChronogicalLayercheck from './ChronogicalLayercheck';
import VisualizationIcon from './visualization.png';
import LosVisualize from './LosVisualize';
import GraphDialog from './GraphDialog';
import styles from "../styles/PopUp.module.css";
import ODVisualize from "./ODVisualize";
import TinyBarChart from "./Barchart";
import AccessibilityList from './AccessibilityList';
// タブレット幅（狭い画面）かどうかを判定する共有フック
import { useBreakpoint } from "./useBreakpoint";
  //reducer関数を作成
const DemandTab = () => {
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
  const { isTablet } = useBreakpoint();
  const floatingStyle = (pos) => ({
    position: "absolute",
    zIndex: 10,
    background: "rgba(255,255,255,0.92)",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    padding: 8,
    ...pos,
  });

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

                   <Box sx={{ width: '100%', height: '80vh', position: 'relative' }}>
                    <div className="map"
                            style={{
                            flex: 1,
                            position: 'absolute', // 重要：DeckGLの親として必須
                            height: '85%',
                            width: '100%',
                          }}>

                      <DemandRenderLayers/>

                        {/* 右上：マウスオーバー情報＋データ操作（可視化/アップロード）パネル */}
                        <div style={floatingStyle({ top: isTablet ? 8 : 16, right: isTablet ? 8 : 16, background: 'transparent', boxShadow: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: isTablet ? 6 : 8 })}>
                          <div style={{ display: 'flex', gap: isTablet ? 8 : 12, alignItems: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: isTablet ? 6 : 8 }}>
                            <MouseOver1/>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: isTablet ? 4 : 6, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: isTablet ? 6 : 8 }}>
                            {/*<Fetch_test/>*/}
                            <ODVisualize/>
                            <ExistedData/>
                            {/*<GraphDialog/>*/}
                          </div>
                        </div>

                        {/* 左上：レイヤー切替パネル */}
                        <div style={floatingStyle({ top: isTablet ? 8 : 16, left: isTablet ? 8 : 16, minWidth: isTablet ? 150 : 180, maxWidth: isTablet ? '45vw' : 260 })}>
                          <select
                            value={layercheckcurrent}
                            onChange={(e) => {setlayercheck(e.target.value);setlayercheckcurrent(e.target.value)}}
                            ref={selectlayercheckref}
                            style={{width:'100%',height:'40px'}}
                          >
                            {layercheck.map((item, index) => (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                          <div style={{ marginTop: 8, maxHeight: isTablet ? '50vh' : undefined, overflowY: isTablet ? 'auto' : undefined }}>
                            <h3 style={{margin:'0 0 4px'}}>レイヤー</h3>
                            <ODLayercheck checked={check}/>
                          </div>
                        </div>
                      </div>

                      <div>
                        {layercheckcurrent==="タイムスライダー"&&
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            height: '13%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            px: 2,
                            boxShadow: 3,
                            zIndex: 10
                          }}
                        >
                          <br />
                          <div>
                            <select
                              value={destcurrent}
                              onChange={(e) => {selectDest(e.target.value);setdestcurrent(e.target.value)}}
                              ref={selectdestref}
                              style={{width:'80px'}}
                              
                            >
                              <option>目的地</option>
                              
                              {dest.map((item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                            <br />
                              
                            <select
                              value={weekdaycurrent}
                              onChange={(e) => {selectWeekday(e.target.value);setweekdaycurrent(e.target.value)}}
                              ref={selectweekdayref}
                              style={{width:'80px'}}
                            >
                              <option>ダイヤ</option>

                              {weekday.map((item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                            <br />
                            <select
                              value={kindcurrent}
                              onChange={(e) => {selectKind(e.target.value);setkindcurrent(e.target.value)}}
                              ref={selectkindref}
                              style={{width:'80px'}}
                            >
                              <option>サービス</option>

                              {kind.map((item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                            <br />
                            <select
                              value={areacurrent}
                              onChange={(e) => {selectArea(e.target.value);setareacurrent(e.target.value)}}
                              ref={selectarearef}
                              style={{width:'80px'}}
                            >
                              <option>地域区分</option>

                              {area.map((item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Typography sx={{ mr: -10, minWidth: 100 }}>
                          </Typography>
                          <br />
                          <Slider 
                            step={0.00000001}
                            marks={marks}
                            track={false}
                            min={-0.00000005}
                            max={0.00000013}
                            value={time}
                            onChangeCommitted={(e, newValue) => {
                              clicktime(newValue);
                            }}
                            aria-label="Volume"  ref={volumeRef} />
                          <div>{/*<p style={{fontSize:'13px'}}><b>{destcurrent}に{parseInt(10+time*100000000)}時～{parseInt(11+time*100000000)}時着の{kindcurrent}({weekdaycurrent}ダイヤ)</b>*/}
                              <p style={{fontSize:'13px'}}>地図データ © Google</p>
                          </div>
                        </Box>}
                      </div>
                    
                      {layercheckcurrent==="複数表示"&&
                    <div>
                      <p>タイムスライダー表示は利用できません</p>
                      
                    </div>}
                    </Box>
                   <br />
                      
                   <div>
                    <div className="radar"style={{ width: '20vw', height:"40vh", zIndex: 10 }}>
                      <AccessibilityList dest={destcurrent} hour ={parseInt(11+time*100000000)} style={{ width: '80%' }}/>
                    </div>
                    {layercheckcurrent==="タイムスライダー"&&
                    <div className="bar"style={{ width: '20vw', height:"40vh",zIndex: 10 }}>
                      
                      <TinyBarChart selectarea={areacurrent} selectweekday={weekdaycurrent} selectdest={destcurrent} selecthour ={parseInt(11+time*100000000)} style={{ width: '80%' }}/>
                    
                      
                    </div>}
                    {layercheckcurrent==="複数表示"&&
                    <div className="bar"style={{ width: '20vw', height:"40vh",zIndex: 10 }}>
                      <p>タイムスライダー表示は利用できません</p>
                      
                    </div>}
                   </div>
                  </div>
           ) 
}
export default DemandTab;