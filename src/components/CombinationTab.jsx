import React, { lazy, Suspense } from 'react';
import {createContext, useContext,useState,useEffect,useRef,useMemo,useCallback} from 'react'
import Map from 'react-map-gl/mapbox';
import ExistedData from "./ExistedData";
import Legends from "./Legends";
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import CombinationLayers from './CombinationRenderLayers'; // TODO: Migrate to Mapbox

import { Slider, Box, Typography } from '@mui/material';
import Discuss from './Discuss';
import FundamentalLayercheck from "./FundamentalLayercheck";
import {initialCheck,mapboxAccessToken,mapstyle,tooltipHandler,marks,COLORS,yakuba} from "./Globalvariable";
import Exportgeojson from "./Exportgeojson";
import Stack from '@mui/material/Stack';
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import MouseOver1 from './MouseOver1';
import Mousearea from "./MouseArea";
import FileValidated from './FileValidated';
import { useClickareaStore,useOrigStore,useLayerflagStore,useDirectStore,useEditStore,useLayercheckStore,useBarchartStore,useAreaStore,useWeekdayStore,useKindStore,useTimesliderStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore, useDestStore,useViewAccesibilityStore} from "./useStore";
import FetchTest from './FetchTest';
import SpatialLayercheck from './SpatialLayercheck';
import ChronogicalLayercheck from './ChronogicalLayercheck';
import VisualizationIcon from './visualization.png';
import LosVisualize from './LosVisualize';
import GraphDialog from './GraphDialog';
import styles from "../styles/PopUp.module.css";
import FundamentalVisualize from "./FundamentalVisualize";
import TinyBarChart from "./Barchart";
import AddressChart from "./AddressChart";
import AccessibleList from './AccessibilityList';
// タブレット幅（狭い画面）かどうかを判定する共有フック
import { useBreakpoint } from "./useBreakpoint";
  //reducer関数を作成
const CombinationTab = () => {
  const isFinishedStep1=useBarchartStore((state)=>state.bar);
// ✅ hookで取る
const time = useTimesliderStore(state => state.time)
const clicktime = useTimesliderStore(state => state.clicktime)
const [data, setData] = useState('');
const [showAddressChart, setShowAddressChart] = useState(false);  // 📌 BarChart 表示/非表示
const [showBarChart, setShowBarChart] = useState(false);  // 📌 BarChart 表示/非表示
const [showAccessibleList, setShowAccessibleList] = useState(false);  // 📌 AccessibleList 表示/非表示
  const { isTablet } = useBreakpoint();
  // 📌 ドラッグ・リサイズ機能用のstate
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [panelSize, setPanelSize] = useState({ width: isTablet ? 400 : 280, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef(null);
  const setorigdestcurrent=useDirectStore((state)=> state.selectOrig);

  const setlayerflag=useLayerflagStore.getState().setLayerflag;
  const area=useAreaStore((state)=> state.area);
  const directdest=useDestStore((state)=> state.directdest);
  const transitdest=useDestStore((state)=> state.transitdest);
  const directorig=useOrigStore((state)=> state.directorig);
  const transitorig=useOrigStore((state)=> state.transitorig);
  const weekday=useWeekdayStore((state)=> state.weekday);
  const direct={"直通":"direct","乗継":"transit"};
  const selectDirect=useDirectStore((state)=> state.selectDirect);
  const layercheck=useLayercheckStore((state)=> state.layercheck);
  const setlayercheck=useLayercheckStore((state)=> state.selectLayercheck);
  const selectDest=useDestStore((state)=> state.selectDest);
  const selectOrig=useOrigStore((state)=> state.selectOrig);
  const Weekdayflag=useWeekdayStore((state)=> state.selectflag);
  const selectWeekdayflag=useWeekdayStore((state)=> state.selectWeekdayflag);
  const Weekday=useWeekdayStore((state)=> state.select);
  const selectWeekday=useWeekdayStore((state)=> state.selectWeekday);
  const selectArea=useAreaStore((state)=> state.selectArea);
  const selectKind=useKindStore((state)=> state.selectKind);
  const kind=useKindStore((state)=> state.kind);
  // hookで取る（画面更新される）
  const clickareapop = useClickareaStore(state => state.clickareapop)
  const clickareahousehold = useClickareaStore(state => state.clickareahousehold)
  const clickareapopdensity = useClickareaStore(state => state.clickareapopdensity)
  const clickareaaddress = useClickareaStore(state => state.clickareaaddress)

  // setterはgetStateでもOK（関数は変わらないので）
  const {
    setClickareaaddress,
    setClickareapop,
    setClickareahousehold,
    setClickareapopdensity
  } = useClickareaStore.getState()
  const edit = useEditStore(state => state.edit)
  const setEdit = useEditStore(state => state.setEdit)
  const [check,setLayerchecked] = useState(initialCheck);
  const volumeRef=useRef();
  const [value, setValue] = useState(time);
    const dest=useDestStore((state)=> state.dest);
  const selectdestref = useRef();
  const selectweekdayref = useRef();
  const selectkindref = useRef();
  const selectarearef=useRef();
  const selectlayercheckref=useRef();
  const selectorigref=useRef();
  const origselectref=useRef();
  const destselectref=useRef();
  const [sliderLabel, setSliderLabel] = useState("");
  const [destcurrent,setdestcurrent]=useState("未選択");
  const [origcurrent,setorigcurrent]=useState("未選択");
  const [origdestcurrent,selectorigdestcurrent]=useState("dest");
  const [directcurrent,setdirectcurrent]=useState("直通");
  const [weekdaycurrent,setweekdaycurrent]=useState("未選択");
  const [layercheckcurrent,setlayercheckcurrent]=useState("複数レイヤー表示");
  const [kindcurrent,setkindcurrent]=useState("所要時間");
  const [areacurrent,setareacurrent]=useState("未選択");
  const [selectedCity,setSelectedCity]=useState("東京都新宿区");
  const [searchText,setSearchText]=useState("");
  const viewAccessibility = useViewAccesibilityStore((state)=>state.select);
  const setViewAccessibility = useViewAccesibilityStore((state)=>state.selectView);

  // 市町村選択時に地図中心を移動
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    setSearchText("");
    if(yakuba[cityName]) {
      const { lat, lng } = yakuba[cityName];
      const newViewState = {
        ...viewAccessibility,
        longitude: lng,
        latitude: lat,
        zoom: 12,
        pitch: 0,
        bearing: 0
      };
      setViewAccessibility(newViewState);
    }
  };
  // テキスト入力で自動選択
  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchText(text);

    if(text.trim() === "") {
      setSelectedCity("東京都新宿区");
      return;
    }

    // yakuba 内で部分マッチする市町村を探す
    const matching = Object.keys(yakuba).find(city =>
      city.includes(text)
    );

    if(matching) {
      setSelectedCity(matching);
      if(yakuba[matching]) {
        const { lat, lng } = yakuba[matching];
        const newViewState = {
          ...viewAccessibility,
          longitude: lng,
          latitude: lat,
          zoom: 12,
          pitch: 0,
          bearing: 0
        };
        setViewAccessibility(newViewState);
      }
    }
  };

  const datepick=(e)=>{
    let datel="0000000";
    const dateindex=e.target.valueAsDate.getUTCDay();
    console.log(dateindex)
    datel=dateindex!="0"?datel.slice(0, parseInt(dateindex)-1) + "1" + datel.slice(parseInt(dateindex)):datel.slice(0, 6) + "1";
    console.log(datel);
    selectWeekday(e.target.valueAsDate);
    selectWeekdayflag(dateindex);
    setweekdaycurrent(e.target.value)
  }
  useEffect(() => {
    const h = 11 + parseInt(time * 100000000)
    setSliderLabel(`選択範囲: ${h}:00-${h + 1}:00`)
  }, [time])
  useEffect(() => {
  },[dest]);
  useEffect(() => {
  },[direct]);
  useEffect(() => {
  },[weekday]);
  useEffect(() => {
  },[kind]);
  useEffect(() => {
  },[isFinishedStep1]);
  const [isPopUpVisible, setPopUpVisible] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const editRef=useRef(null);
  const selectdirectref=useRef(null);
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

  // 📌 初期位置設定
  useEffect(() => {
    if ((showBarChart || showAccessibleList) && panelPosition.x === 0 && panelPosition.y === 0) {
      setPanelPosition({
        x: window.innerWidth - panelSize.width - 16,
        y: isTablet ? 60 : 100
      });
    }
  }, [showBarChart, showAccessibleList]);

  // 📌 ドラッグ開始
  const handlePanelMouseDown = (e) => {
    if ((e.target.closest('button') || e.target.closest('select') || e.target.closest('input'))) {
      return; // ボタンやフォーム要素をクリック時はドラッグしない
    }
    setIsDragging(true);
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 📌 リサイズハンドルをマウスダウン
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: panelSize.width,
      height: panelSize.height
    });
  };

  // 📌 ドラッグ・リサイズ中の処理
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        setPanelPosition({
          x: newX,
          y: newY
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newWidth = Math.max(250, resizeStart.width + deltaX);
        let newHeight = Math.max(300, resizeStart.height + deltaY);

        setPanelSize({
          width: newWidth,
          height: newHeight
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const floatingStyle = (pos) => ({
  position: "absolute",
  zIndex: 10,
  background: "rgba(255,255,255,0.92)",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  padding: 8,
  ...pos,
});
  /*
  const editf=()=>{
    console.log(edit);
    setEdit();
    console.log(edit);
    edit===false?editRef.current.textContent="路線描画不可":editRef.current.textContent="路線描画可能";

  } */
  return (
<div className="clear" style={{
                    display: 'flex',
                    border:'solid',
                    width: '80vw',
                    height: '80vh',
                    position: 'relative' // 全体の基準
                  }}>

                  <script src="https://cdn.rawgit.com/osamutake/japanese-holidays-js/v1.0.6/lib/japanese-holidays.min.js"></script>

                   <Box sx={{ width: '100%', height: '80vh', position: 'relative' }}>

                    <div className="map"
                            style={{
                            flex: 1,
                            position: 'absolute', // 重要：DeckGLの親として必須
                            height: '85%',
                            width: '100%',
                            paddingTop: isTablet ? 56 : 60,
                            boxSizing: 'border-box',
                          }}>

                      {/* 市町村選択ドロップダウン（地図上部に固定） */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 15,
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderBottom: `1px solid ${COLORS.border}`,
                        padding: isTablet ? '8px 12px' : '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isTablet ? 8 : 12,
                        flexWrap: 'wrap',
                      }}>
                        <label style={{ fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap', margin: 0 }}>地図表示する市町村を入力もしくは選択</label>
                        <input
                          type="text"
                          value={searchText}
                          onChange={handleSearchChange}
                          placeholder="検索..."
                          style={{
                            height: 36,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 6,
                            color: COLORS.text,
                            fontSize: 13,
                            padding: '0 8px',
                            minWidth: isTablet ? 120 : 150,
                          }}
                        />
                        <select
                          value={selectedCity}
                          onChange={handleCityChange}
                          style={{
                            height: 36,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 6,
                            color: COLORS.text,
                            fontSize: 13,
                            padding: '0 8px',
                            minWidth: isTablet ? 180 : 220,
                          }}
                        >
                          {Object.keys(yakuba).map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <CombinationLayers/>

                        

                        {/* 左上：レイヤー切替パネル。タブレットでは幅を絞り、セレクトの高さをタップしやすいサイズに保つ。
                            maxWidthは常に指定し、凡例（Legends）がタイムスライダー操作で文字幅・行数を変えても
                            白背景パネルの外に飛び出さないようにする。 */}
                        <div style={floatingStyle({ top: isTablet ? 8 : 100, left: isTablet ? 8 : 16, minWidth: isTablet ? 150 : 180, maxWidth: isTablet ? '45vw' : 260 })}>
                          <select
                            value={layercheckcurrent}
                            onChange={(e) => {setlayercheck(e.target.value);setlayerflag(1);setlayercheckcurrent(e.target.value)}}
                            ref={selectlayercheckref}
                            style={{
                              width: '100%',
                              height: 40,
                              border: `1px solid ${COLORS.border}`,
                              borderRadius: 6,
                              color: COLORS.text,
                              fontSize: 13,
                              padding: '0 8px',
                            }}
                          >
                            {layercheck.map((item, index) => (
                              <option key={index} value={item}>{item}</option>
                            ))}
                          </select>
                          {layercheckcurrent==="複数レイヤー表示"&&
                          <div style={{ marginTop: 8, maxHeight: isTablet ? '50vh' : undefined, overflowY: isTablet ? 'auto' : undefined }}>
                            <h3 style={{margin:'0 0 4px'}}>レイヤー</h3>
                            <SpatialLayercheck checked={check}/>
                          </div>}
                            {layercheckcurrent==="タイムスライダー"&&
                            <div style={{ marginTop: 8, maxHeight: isTablet ? '50vh' : undefined, overflowY: isTablet ? 'auto' : undefined }}>
                            <Legends selectkind={kindcurrent}/>
                            </div>}
                        </div>
                      </div>
                      {layercheckcurrent==="タイムスライダー"&&
                      <p>{destcurrent}に{parseInt(10+time*100000000)}-{parseInt(11+time*100000000)}到着(芸陽バス){weekdaycurrent}ダイヤ</p>}
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
                          <div style={{"display": "flex"}}>
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
                            <div className="select">
                              <input type="Date"
                                value={weekdaycurrent}
                                onChange={(e) => datepick(e)}
                                ref={selectweekdayref}></input>
                              <br />
                              <select
                                value={kindcurrent}
                                onChange={(e) => {selectKind(e.target.value);setkindcurrent(e.target.value)}}
                                ref={selectkindref}
                                style={{width:'100px',height:'40px'}}
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
                                style={{width:'100px',height:'40px'}}
                              >
                                <option>地域区分</option>

                                {area.map((item, index) => (
                                  <option key={index} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>

                            </div>
                          </div>
                          <Typography sx={{ mr: -10, minWidth: 100 }}>
                          </Typography>

                          <br />
                          <Slider
                            step={0.00000001}
                            marks={marks}
                            track={false}
                            min={-0.00000007}
                            max={0.00000013}
                            value={time}
                            onChangeCommitted={(e, newValue) => {
                              clicktime(newValue);
                            }}
                            aria-label="Volume"  ref={volumeRef} />

                          <div>
                            <p style={{fontSize:'13px'}}>地図データ © Google</p>
                          </div>

                        </Box>}
                      </div>

                    {/* 📌 ドラッグ・リサイズ可能なデータ表示パネル */}
                    {(showBarChart || showAccessibleList) && (
                    <div
                      ref={panelRef}
                      onMouseDown={handlePanelMouseDown}
                      style={{
                        position: 'fixed',
                        left: `${panelPosition.x}px`,
                        top: `${panelPosition.y}px`,
                        width: `${panelSize.width}px`,
                        height: `${panelSize.height}px`,
                        background: '#fff',
                        boxShadow: isDragging || isResizing ? '0 8px 24px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.25)',
                        borderRadius: 8,
                        zIndex: 9999,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        cursor: isDragging ? 'grabbing' : 'default',
                        pointerEvents: 'auto',
                        transition: (isDragging || isResizing) ? 'none' : 'box-shadow 0.2s'
                      }}>
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                      {/* グラフパネルのクローズボタン */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', cursor: 'grab', userSelect: 'none', background: '#fafafa', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>📊 データ表示</h3>
                        <button
                          onClick={() => {setShowBarChart(false); setShowAccessibleList(false); setShowAddressChart(false);}}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 24,
                            cursor: 'pointer',
                            color: '#666',
                            padding: 0,
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      {/* グラフコンテンツ */}
                      {layercheckcurrent==="タイムスライダー" && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', padding: '12px 16px' }}>
                          {showAccessibleList && (
                            <div style={{ flex: 1, minHeight: '300px', border: '1px solid #e0e0e0', borderRadius: 6, padding: 8 }}>
                              <AccessibleList layercheckcurrent={layercheckcurrent} selectdirect={directcurrent} selectorigdest={origdestcurrent} selectorig={origcurrent} selectkind={kindcurrent} selectarea={areacurrent} selectweekday={weekdaycurrent} selectdest={destcurrent} selecthour ={parseInt(11+time*100000000)} style={{ width: '100%' }}/>
                            </div>
                          )}

                          {showBarChart && (
                            <div style={{ flex: 1, minHeight: '300px', border: '1px solid #e0e0e0', borderRadius: 6, padding: 8 }}>
                              <TinyBarChart layercheckcurrent={layercheckcurrent} selectdirect={directcurrent} selectorigdest={origdestcurrent} selectorig={origcurrent} selectkind={kindcurrent} selectarea={areacurrent} selectweekday={weekdaycurrent} selectdest={destcurrent} selecthour ={parseInt(11+time*100000000)} style={{ width: '100%' }}/>
                            </div>
                          )}


                          {!showAccessibleList && !showBarChart&&(
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                              <p>テーブルまたはグラフボタンをクリック</p>
                            </div>
                          )}
                        </div>
                      )}

                      {layercheckcurrent==="複数レイヤー表示" && (showBarChart || showAccessibleList) && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', padding: '12px 16px' }}>
                          <p>このモードではデータは表示できません</p>
                        </div>
                      )}
                    </div>

                    {/* 📌 リサイズハンドル（右下隅） */}
                    <div
                      onMouseDown={handleResizeMouseDown}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '20px',
                        height: '20px',
                        cursor: 'nwse-resize',
                        userSelect: 'none',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        paddingRight: '2px',
                        paddingBottom: '2px',
                        color: '#ccc'
                      }}
                    >
                      ⋰
                    </div>
                    </div>
                    )}
                    </Box>
                   <br />
                  <div>

                  </div>
                  </div>
           )
}
export default CombinationTab;
