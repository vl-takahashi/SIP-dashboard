import React, { lazy, Suspense } from 'react';
import {createContext, useContext,useState,useEffect,useRef,useMemo,useCallback} from 'react'
import Map from 'react-map-gl/mapbox';
import ExistedData from "./ExistedData";
import Ledends from "./Legends";
import 'mapbox-gl/dist/mapbox-gl.css';
import UpdateLayers from './AccessibilityRenderLayers';

import { Slider, Box, Typography, Button, Alert } from '@mui/material';
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
import { useBreakpoint } from "./useBreakpoint";
// 📌 アップロードストアをインポート
import { useUploadStore } from "./useUploadStore";

const AccessibilityTab = () => {
  const isFinishedStep1=useBarchartStore((state)=>state.bar);
  const time = useTimesliderStore(state => state.time)
  const clicktime = useTimesliderStore(state => state.clicktime)
  const [data, setData] = useState('');
  const [showAddressChart, setShowAddressChart] = useState(false);
  const [showBarChart, setShowBarChart] = useState(false);
  const [showAccessibleList, setShowAccessibleList] = useState(false);
  const { isTablet } = useBreakpoint();

  // 📌 アップロード状態管理
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);

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
  const direct=["直通","乗継"];
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

  const clickareapop = useClickareaStore(state => state.clickareapop)
  const clickareahousehold = useClickareaStore(state => state.clickareahousehold)
  const clickareapopdensity = useClickareaStore(state => state.clickareapopdensity)
  const clickareaaddress = useClickareaStore(state => state.clickareaaddress)

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

  // 📌 useDataStore のメソッド
  const addData = useDataStore((state) => state.addData);

  // 📌 ファイルアップロード処理
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setUploadStatus('読み込み中...');

    try {
      const uploadedFiles = [];

      for (let file of files) {
        const text = await file.text();
        const data = JSON.parse(text);

        console.log(`📤 アップロード: ${file.name}, property:`, data.property);

        // ファイルデータを保存
        uploadedFiles.push(data);

        // propertyごとにステータス表示
        if (data.property === 'popmesh' || data.property === 'addressed') {
          setUploadStatus(`✅ ${file.name} を読み込みました（住所データ）`);
          console.log('✅ popmesh/addressed データ読み込み:', data);
        } else if (data.property === 'ridingtime_direct_dest' || data.property === 'ridingtime_transit_dest') {
          setUploadStatus(`✅ ${file.name} を読み込みました（乗車時間データ）`);
          console.log('✅ ridingtime データ読み込み:', data);
        }
      }

      // 📌 すべてのデータを useDataStore に保存
      if (uploadedFiles.length > 0 && addData) {
        uploadedFiles.forEach((data) => {
          addData(data);
        });
        console.log('📥 useDataStore に保存しました:', uploadedFiles.length, '件');
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('❌ ファイル読み込みエラー:', error);
      setUploadStatus(`❌ エラー: ${error.message}`);
      setIsLoading(false);
    }
  };

  // 既存のコード（ドラッグ・リサイズなど）...
  const floatingStyle = (pos) => ({
    position: "absolute",
    zIndex: 10,
    background: "rgba(255,255,255,0.92)",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    padding: 8,
    ...pos,
  });

  return (
    <div className="clear" style={{
      display: 'flex',
      border:'solid',
      width: '80vw',
      height: '80vh',
      position: 'relative'
    }}>

      <script src="https://cdn.rawgit.com/osamutake/japanese-holidays-js/v1.0.6/lib/japanese-holidays.min.js"></script>

      <Box sx={{ width: '100%', height: '80vh', position: 'relative' }}>

        <div className="map"
          style={{
            flex: 1,
            position: 'absolute',
            height: '85%',
            width: '100%',
            paddingTop: isTablet ? 56 : 60,
            boxSizing: 'border-box',
          }}>

          <UpdateLayers/>

          {/* 右上：情報表示切替 */}
          <div style={floatingStyle({ top: isTablet ? 60 : 68, right: isTablet ? 8 : 16, background: 'transparent', boxShadow: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: isTablet ? 6 : 8 })}>
            <div style={{ display: 'flex', gap: isTablet ? 8 : 12, alignItems: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: isTablet ? 6 : 8 }}>
              <MouseOver1/>
              <Mousearea/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isTablet ? 4 : 6, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: isTablet ? 6 : 8 }}>
              <FundamentalVisualize/>
              <ExistedData/>

              {/* 📌 ファイルアップロードボタン */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  background: '#FF6B00',
                  color: '#fff',
                  fontWeight: 'bold',
                  '&:hover': { background: '#E55A00' },
                }}
              >
                📤 JSONアップロード
              </Button>
            </div>
          </div>

          {/* 📌 アップロード状態表示 */}
          {uploadStatus && (
            <div style={floatingStyle({ bottom: 16, left: 16, maxWidth: 300, background: uploadStatus.startsWith('✅') ? '#C8E6C9' : '#FFCDD2', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' })}>
              <Typography variant="caption">
                {uploadStatus}
              </Typography>
            </div>
          )}

          {/* 左上：レイヤー切替パネル */}
          <div style={floatingStyle({ top: isTablet ? 8 : 100, left: isTablet ? 8 : 16, minWidth: isTablet ? 150 : 180, maxWidth: isTablet ? '45vw' : 260 })}>
            {/* 既存の選択コンポーネント */}
          </div>
        </div>

      </Box>
    </div>
  );
};

export default AccessibilityTab;
