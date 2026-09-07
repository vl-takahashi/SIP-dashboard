import React, { lazy, Suspense } from 'react';
import {createContext, useContext,useState,useEffect,useRef,useMemo,useCallback} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import UpdateLayers from './CombinationRenderLayers'; // TODO: Migrate to Mapbox

import SidebarVisualizemenu from "./SidebarVisualizeMenu";
import { Slider, Box, Typography } from '@mui/material';
import Discuss from './Discuss';
import FundamentalLayercheck from "./FundamentalLayercheck";
import {initialCheck,mapboxAccessToken,mapstyle,tooltipHandler,marks} from "./Globalvariable";

import Stack from '@mui/material/Stack';
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import MouseOver1 from './MouseOver1';
import FileValidated from './FileValidated';
import { useClickareaStore,useLayercheckStore,useOrigStore,useBarchartStore,useAreaStore,useWeekdayStore,useKindStore,useTimesliderStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore, useDestStore} from "./useStore";
import { useQuestionsStore } from './useQuestionsStore';
import FetchTest from './FetchTest';
import SpatialLayercheck from './SpatialLayercheck';
import ODLayercheck from './ODLayercheck';
import ChronogicalLayercheck from './ChronogicalLayercheck';
import VisualizationIcon from './visualization.png';
import LosVisualize from './LosVisualize';
import GraphDialog from './GraphDialog';
import styles from "../styles/PopUp.module.css";
import FundamentalVisualize from "./FundamentalVisualize";
import ExistedData from "./ExistedData";
import GapBarChart from "./GapBarchart";
import GapRadar from "./GapRadar";
// タブレット幅（狭い画面）かどうかを判定する共有フック
import { useBreakpoint } from "./useBreakpoint";
  //reducer関数を作成
const CombinationTab = () => {
  // URL から sessionId を取得
  const [sessionId, setSessionId] = useState(null);
    const selectDirect=useDirectStore((state)=> state.selectDirect);
  const questions = useQuestionsStore((state) => state.questions);
  const setQuestions = useQuestionsStore((state) => state.setQuestions);

  // Vercel KV から Q1/Q2/Q3 データを取得
  const fetchQuestionsData = async (sid) => {
    try {
      console.log('🔄 Q1/Q2/Q3 データを取得中:', sid);

      const dashboardUrl = process.env.REACT_APP_DASHBOARD_URL || 'https://sip-dashboard-ghe9.vercel.app';
      const apiUrl = `${dashboardUrl}/api/questions?sessionId=${sid}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-Session-ID': sid,
          'X-Tenant-ID': sid,
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Q1/Q2/Q3 データ取得エラー (${response.status})`);
        return;
      }

      const data = await response.json();
      console.log('✅ Q1/Q2/Q3 データを取得:', data);

      // useQuestionsStore に設定
      setQuestions(
        sid,
        data.q1_destination,
        data.q2_latitude,
        data.q2_longitude,
        data.q3_arrival_time,
        data.address
      );
    } catch (error) {
      console.error('❌ fetchQuestionsData エラー:', error);
    }
  };

  // sessionId を URL から取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('sessionId');
    console.log('🔍 URL から sessionId を取得:', sid);
    if (sid) {
      setSessionId(sid);
      fetchQuestionsData(sid);
    }
  }, []);

  const isFinishedStep1=useBarchartStore((state)=>state.bar);
  const time=useTimesliderStore((state)=> state.time);
  const area=useAreaStore((state)=> state.area);
  const directdest=useDestStore((state)=> state.directdest);
  const transitdest=useDestStore((state)=> state.transitdest);
  const directorig=useOrigStore((state)=> state.directorig);
  const transitorig=useOrigStore((state)=> state.transitorig);
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
    const selectdirectref=useRef(null);
    const selectorigref=useRef();
    const origselectref=useRef();
    const destselectref=useRef();
  const direct={"直通":"direct","乗継":"transit"};
  const [sliderLabel, setSliderLabel] = useState("");
  const [origcurrent,setorigcurrent]=useState("未選択");
  const [origdestcurrent,selectorigdestcurrent]=useState("dest");
  const [directcurrent,setdirectcurrent]=useState("直通");
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

                      <UpdateLayers/>

                        {/* 右上：マウスオーバー情報＋データ操作（可視化/アップロード）パネル */}
                        <div style={floatingStyle({ top: isTablet ? 8 : 16, right: isTablet ? 8 : 16, background: 'transparent', boxShadow: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: isTablet ? 6 : 8 })}>
                          <div style={{ display: 'flex', gap: isTablet ? 8 : 12, alignItems: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: isTablet ? 6 : 8 }}>
                            <MouseOver1/>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: isTablet ? 4 : 6, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: isTablet ? 6 : 8 }}>
                            {/*<Fetch_test/>*/}
                            <FundamentalVisualize/>
                            <ExistedData/>
                            {/*<GraphDialog/>*/}
                          </div>
                        </div>

                        {/* 左上：レイヤー切替パネル（供給＝アクセシビリティ／需要＝OD分析を見出しで区別） */}
                        <div style={floatingStyle({ top: isTablet ? 8 : 16, left: isTablet ? 8 : 16, minWidth: isTablet ? 150 : 180, maxWidth: isTablet ? '45vw' : 260, maxHeight: '70vh', overflowY: 'auto' })}>
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
                          <div style={{marginTop:8}}>
                            <h3 style={{margin:'0 0 4px'}}>レイヤー</h3>
                            <div style={{marginTop:4}}>
                              <div style={{fontWeight:'bold', backgroundColor:'#08335c', color:'white', textAlign:'center', padding:'2px 0'}}>供給（アクセシビリティ）</div>
                              <SpatialLayercheck checked={check}/>
                            </div>
                            <div style={{marginTop:8}}>
                              <div style={{fontWeight:'bold', backgroundColor:'#08335c', color:'white', textAlign:'center', padding:'2px 0'}}>需要（OD分析）</div>
                              <ODLayercheck/>
                            </div>
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
                            <div className="select">

                              <select
                                value={directcurrent}
                                onChange={(e) => {selectDirect(e.target.value);setdirectcurrent(e.target.value)}}
                                ref={selectdirectref}
                                style={{width:'100px',height:'40px'}}
                              >
                                <option>直通/乗り継ぎ</option>

                                {Object.keys(direct).map((item) => (
                                  <option key={item} value={direct[item]}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                              <br />
                              <fieldset>
                                <input type="radio" value="dest" ref={origselectref}
                                onChange={(e) => {selectorigdestcurrent(e.target.value),setorigdestcurrent(e.target.value),origselectref.current.checked?!origselectref.current.checked:!origselectref.current.checked,origselectref.current.checked?destselectref.current.checked=false:destselectref.current.checked=true}}/>
                                <label>目的地</label>
                                <br></br>
                                <input type="radio" value="orig" ref={destselectref}
                                onChange={(e) => {selectorigdestcurrent(e.target.value),setorigdestcurrent(e.target.value),destselectref.current.checked?!destselectref.current.checked:!destselectref.current.checked,destselectref.current.checked?origselectref.current.checked=false:origselectref.current.checked=true}}/>
                                <label>出発地</label>
                              {origdestcurrent==="dest"&&directcurrent=="direct"&&<div><select
                                value={destcurrent}
                                onChange={(e) => {selectDest(e.target.value);setdestcurrent(e.target.value)}}
                                ref={selectdestref}
                                style={{width:'100px',height:'40px'}}

                              >
                                <option>目的地</option>

                                {directdest.map((item, index) => (
                                  <option key={index} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                              <br /></div>}
                              {origdestcurrent==="dest"&&directcurrent=="transit"&&<div><select
                                value={destcurrent}
                                onChange={(e) => {selectDest(e.target.value);setdestcurrent(e.target.value)}}
                                ref={selectdestref}
                                style={{width:'100px',height:'40px'}}

                              >
                                <option>目的地</option>

                                {transitdest.map((item, index) => (
                                  <option key={index} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                              <br /></div>}
                              {origdestcurrent==="orig"&&directcurrent=="direct"&&<div>
                              <select
                                value={origcurrent}
                                onChange={(e) => {selectOrig(e.target.value);setorigcurrent(e.target.value)}}
                                ref={selectorigref}
                                style={{width:'100px',height:'40px'}}

                              >
                                <option>出発地</option>

                                {directorig.map((item, index) => (
                                  <option key={index} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                              <br />
                                </div>}
                              {origdestcurrent==="orig"&&directcurrent=="transit"&&<div><select
                                value={destcurrent}
                                onChange={(e) => {selectDest(e.target.value);setdestcurrent(e.target.value)}}
                                ref={selectdestref}
                                style={{width:'100px',height:'40px'}}

                              >
                                <option>目的地</option>

                                {transitorig.map((item, index) => (
                                  <option key={index} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                              <br /></div>}
                              </fieldset>
                            </div>
                              
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
                      <GapRadar dest={destcurrent} hour ={parseInt(11+time*100000000)} style={{ width: '80%' }}/>
                    </div>
                    {layercheckcurrent==="タイムスライダー"&&
                    <div className="bar"style={{ width: '20vw', height:"40vh",zIndex: 10 }}>
                      
                      <GapBarChart selectarea={areacurrent} selectweekday={weekdaycurrent} selectdest={destcurrent} selecthour ={parseInt(11+time*100000000)} style={{ width: '80%' }}/>
                    
                      
                    </div>}
                    {layercheckcurrent==="複数表示"&&
                    <div className="bar"style={{ width: '20vw', height:"40vh",zIndex: 10 }}>
                      <p>タイムスライダー表示は利用できません</p>
                      
                    </div>}
                   </div>
                  </div>
           ) 
}
export default CombinationTab;