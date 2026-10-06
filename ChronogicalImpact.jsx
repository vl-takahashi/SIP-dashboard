import React from 'react';
import {createContext, useContext,useState,useRef,useEffect} from 'react'
import {useDataStore,useDestStore,useOrigStore,usePooledweekdayStore,useWeekdayStore,useLoadingStore} from "./useStore";
import { FieldLabel, FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";
import { COLORS } from "./Globalvariable";
import Alert from '@mui/material/Alert';
import JSZip from "jszip";
import { Slider, Box, Typography } from '@mui/material';

// import { fetch as tauriFetch } from '@tauri-apps/plugin-http'; // Tauri removed

// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';

// Step区切りのカード風ボックス（各Stepの視覚的まとまりを示す）

// Step区切りのカード風ボックス（各Stepの視覚的まとまりを示す）
const stepBoxStyle = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: '14px 16px',
  marginBottom: 14,
  background: '#FAFAFA',
};
const hintTextStyle = { margin: '4px 0 8px', fontSize: 12, color: COLORS.subtext };

const ChronogicalImpact = () => {
  // GTFSのCSV(agency.txt等)は基本カンマ区切りだが、値に","を含む場合は""で囲まれる。
    // 完全なRFC4180パーサーではないが、GTFS程度の単純なCSVなら十分実用できる簡易パーサー。
    const parseCsvLine = (line) => {
      const result = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === "," && !inQuotes) {
          result.push(cur);
          cur = "";
        } else {
          cur += c;
        }
      }
      result.push(cur);
      return result.map((s) => s.trim());
    };

  const dest1 = useDestStore((state)=>state.dest);
  const setDirectDest = useDestStore((state)=>state.setDirectdest);
  const setTransitDest = useDestStore((state)=>state.setTransitdest);
  const setDirectOrig = useDestStore((state)=>state.setDirectorig);
  const setTransitOrig = useDestStore((state)=>state.setTransitorig);
  const setWeekday = useWeekdayStore((state)=>state.setWeekday);
  const destRef = useRef();
  const interval_hmRef = useRef();
  const cityRef = useRef();
  const innerRef = useRef();
  const transitRef = useRef();
  const transit_timeRef = useRef();
  const transit_distanceRef = useRef();
  const originRef=useRef();
  const setDirectdest = useDestStore((state)=>state.setDirectdest);
  const setTransitdest = useDestStore((state)=>state.setTransitdest);
  const setPooledweekday=usePooledweekdayStore((state)=>state.setPooledweekday);
  const data = useDataStore((state) => state.data);
  const [origincurrent,originSetcurrent]=useState("dest");
  const [directcurrent,setdirectcurrent]=useState("direct");
  const [submit,submitbutton]=useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const setinner = useDataStore((state) => state.setinner);
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
const [agencyOptions, setAgencyOptions] = useState([]);
    const [agencyValue, setAgencyValue] = useState("");
    const handleGtfsZipChange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const zip = await JSZip.loadAsync(file);
        // ファイル名は"agency.txt"や"gtfs/agency.txt"のように階層が付くこともあるので末尾一致で探す
        const agencyEntry = Object.values(zip.files).find((f) =>
          f.name.toLowerCase().endsWith("agency.txt")
        );
        if (!agencyEntry) {
          console.log("agency.txtがGTFS(zip)内に見つかりませんでした。手入力に切り替えます。");
          setAgencyOptions([]);
          return;
        }
        const text = await agencyEntry.async("string");
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setAgencyOptions([]);
          return;
        }
        const header = parseCsvLine(lines[0]);
        const nameIdx = header.indexOf("agency_name");
        if (nameIdx === -1) {
          console.log("agency.txtにagency_name列が見つかりませんでした。手入力に切り替えます。");
          setAgencyOptions([]);
          return;
        }
        const names = lines.slice(1).map((l) => parseCsvLine(l)[nameIdx]).filter(Boolean);
        const uniqueNames = Array.from(new Set(names));
        setAgencyOptions(uniqueNames);
        if (uniqueNames.length > 0) {
          setAgencyValue(uniqueNames[0]);
        }
      } catch (err) {
        console.log("GTFS(zip)の事業者名自動検出に失敗しました:", err.message);
        setAgencyOptions([]);
      }
    };
  // ★ 修正：Vercel API ルート経由で診断モジュールを呼び出し（バッファ読み込み版）
  const fileRef = useRef();
    const destfileRef = useRef();
    const popmeshfilesRef = useRef();
    const nearestmeterRef = useRef();
    const meter2Ref = useRef();
    const agencyRef = useRef();
  
    const setData = useDataStore((state) => state.setData);
    const setAgency = useDataStore((state) => state.setAgency);
    const setLoading = useLoadingStore((state) => state.setLoading);
  
    const [taskId, setTaskId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    //vl-sip
    const API_BASE = 'module';
    const API_ENDPOINT = 'chronogical_impact';
    const POLL_INTERVAL = 1000;
  
    const fetchDataAsync = async (formData) => {
      setLoading(true);
      setError(null);
      setProgress(0);
  
      try {
        const response = await fetch(`${API_BASE}/${API_ENDPOINT}`, {
          method: 'POST',
          body: formData,
        });
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? value.name : value);
        }
        console.log(response);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
  
        const result = await response.json();
        if (!result.task_id) throw new Error('No task_id returned');
  
        setTaskId(result.task_id);
        setProgress(10);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (!taskId) return;
  
      const pollResults = async () => {
        try {
          const response = await fetch(`${API_BASE}/result/${taskId}`);
          if (!response.ok) throw new Error('Status check failed');
  
          const result = await response.json();
  
          if (result.status === 'completed') {
            setProgress(90);
            await handleSuccess(result.result);
            setTaskId(null);
            setProgress(100);
            setLoading(false);
          } else if (result.status === 'failed') {
            throw new Error(result.error || '処理に失敗しました');
          } else {
            setProgress((prev) => Math.min(prev + 5, 85));
          }
        } catch (err) {
          console.error('Polling error:', err);
          setError(err.message);
          setTaskId(null);
          setLoading(false);
        }
      };
  
      const interval = setInterval(pollResults, POLL_INTERVAL);
      return () => clearInterval(interval);
    }, [taskId]);
  
    const handleSuccess = async (data) => {
      try {
        const zip = new JSZip();
        let fileCount = 0;
  
        for (let d in data.property) {
          let dp0 = 'chronological_impact';
          let dp1 = data.filename[d];
          let d0 = data.data[d];
          d0.property = dp0;
  
          let d01 = JSON.stringify(
            { property: dp0, data: d0, detail: data.property[d], agency: '' },
            null,
            2
          );
  
          zip.file(`${API_ENDPOINT}_${dp1}_metadata.json`, d01);
          zip.file(`${API_ENDPOINT}_${dp1}.geojson`, JSON.stringify(d0, null, 2));
  
          setData({ detail: dp1, checked: true, data: d0 }, dp0);
          fileCount++;
        }
  
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `${API_ENDPOINT}_${new Date().getTime()}.zip`;
        link.click();
  
        window.alert(`✅ 完了: ${fileCount}ファイル`);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
  
      try {
        let formData = new FormData();
  
        const file = fileRef.current?.files;
      const destr = destRef.current?.value?.trim();
      const destfiler = destfileRef.current?.files;
      const interval_hm = interval_hmRef.current?.value;
      const transit_distancer = transit_distanceRef.current?.value;
      const transit_timer = transit_timeRef.current?.value;
      const transit = transitRef.current?.value;
      const orig1 = originRef.current?.value;
      const nearestmeter = nearestmeterRef.current?.value;
      const inner = innerRef.current?.value;

      // ★ 入力値検証
      if (!file || file.length === 0) {
        throw new Error("GTFS ZIPファイルを選択してください");
      }

      if (!destr && (!destfiler || destfiler.length === 0)) {
        throw new Error("施設名またはファイルのいずれかを選択してください");
      }

      if (orig1 === "destination") {
        if(transit=="direct"){
          setDirectdest(destr || "指定なし");

        } else{
          
          setTransitdest(destr || "指定なし");
        }
      } else {
        if(transit=="direct"){
          setDirectOrig(destr || "指定なし");

        } else{
          
          setTransitOrig(destr || "指定なし");
        }
      }

      console.log("入力値検証完了");

      // FormData 構築
      for (const f of file) {
        console.log("GTFS ファイル追加:", f.name);
        formData.append('file', f);
      }


      formData.append('dest', destr);
      formData.append('nearestmeter', nearestmeter);
      formData.append('interval_hm', interval_hm);
      formData.append('origin', orig1);
      formData.append('kind', submit);
      formData.append('inner', inner);

      // ✅ メッシュID だけ抽出して送信（ペイロード削減）
      const popmesh = data["popmesh"] || [];
      // メッシュID を抽出
      const meshIds = [];
      for (const geojson of popmesh) {
      console.log(geojson.data)
        
        if (geojson.data?.features) {
          for (const feature of geojson.data.features) {
            const meshId = feature.properties?.MESH_ID || feature.properties?.KEY_CODE;
            if (meshId) {
              meshIds.push(meshId);
            }
          }
        }
      }

      console.log('✅ メッシュID 抽出:', {
        meshIdCount: meshIds.length,
        sampleIds: meshIds.slice(0, 5)
      });

      // メッシュID を元のキー名で送信
      formData.append('meshdf', JSON.stringify(meshIds));


      // 乗り継ぎ関連パラメータ
      if (transit === "transit") {
        formData.append('transit', "transit");
        formData.append('transit_distance', transit_distancer);
        formData.append('transit_time', transit_timer);
      } else {
        formData.append('transit', "direct");
      }

      console.log("FormData 内容:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? value.name : value}`);
      }
      console.log('fetchDataAsync を呼び出します');
      await fetchDataAsync(formData);
      console.log('fetchDataAsync が完了しました');
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
    };
  
    return (
      <div>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!taskId ? (
          <form action="" method="POST" encType="multipart/form-data" onSubmit={handleSubmit}>
                <div>
                    <div style={stepBoxStyle}>
                      <div style={{"display":"flex"}}>
                        <FieldLabel>Step0. 目的地までですか、出発地からですか？</FieldLabel>
                        <SelectField selectRef={originRef} onChange={(e) =>originSetcurrent(e.target.value)}>
                        <option value="dest" selected>目的地まで</option>
                        <option value="orig">出発地から</option>
                        </SelectField>
                      </div>
                    </div>
                    <div style={stepBoxStyle}>
                    <FieldLabel>Step1. 目的地・出発地の設定</FieldLabel>
                    <TextField inputRef={destRef} placeholder="目的地・出発地を入力" inline/>
                    </div>

                    <div style={stepBoxStyle}>
                      <FieldLabel>Step2. 時刻表設定</FieldLabel>
                      <TextField label="施設から最寄り駅・バス停までの距離(m)" inputRef={nearestmeterRef} defaultValue="300" size="10" inline />
                      <FileField
                        label="GTFS(zip)"
                        hint="バス停・時刻表データ(GTFS zip)をドロップまたは選択してください。"
                        onChange={handleGtfsZipChange}
                        inputRef={fileRef}
                        multiple
                        accept=".zip"
                      />
                    
                    {/*{agencyOptions.length > 0 ? (
                        <SelectField
                          label="事業者"
                          selectRef={agencyRef}
                          value={agencyValue}
                          inline
                        >
                          {agencyOptions.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </SelectField>
                      ) : (
                        <TextField label="事業者" inputRef={agencyRef} placeholder="GTFS(zip)選択後に自動候補が出ます。出ない場合は入力してください" inline />
                      )}*/}
                    </div>
                    
                    <div style={stepBoxStyle}>
                      <FieldLabel>Step3. 便の存在間隔</FieldLabel>
                      <TextField label="〇分刻み" inputRef={interval_hmRef} defaultValue="30" inline/>

                    </div>
                    <div style={stepBoxStyle}>
                      <FieldLabel>Step4. 最寄り乗車バス停からの距離</FieldLabel>
                      <TextField label="(m)" inputRef={innerRef} defaultValue="300" size="20" inline />

                    </div>
                                    
                    <div style={stepBoxStyle}>
                    {origincurrent=="dest"&&
                    <SelectField label="Step4. 入力地点到着便←乗り継ぎ便も考慮しますか？" selectRef={transitRef} inline onChange={(e) =>setdirectcurrent(e.target.value)}>
                      <option value="direct">到着便にアクセス可能なエリア</option>
                    <option value="transit">到着便への乗り継ぎ便にアクセス可能なエリア</option>
                    
                    </SelectField>}
                    {origincurrent=="orig"&&<SelectField label="Step4. 入力地点出発便→乗り継ぎ便も考慮しますか？" selectRef={transitRef} inline onChange={(e) =>setdirectcurrent(e.target.value)}>
                      <option value="direct">出発便にアクセス可能なエリア</option>
                    <option value="transit">出発便からの乗り継ぎ便にアクセス可能なエリア</option>
                    
                    </SelectField>}
                    </div>
                  {directcurrent=="transit"&&
                    <div style={stepBoxStyle}>
                    <FieldLabel>Step4-1. 乗り継ぎ便の条件を入力</FieldLabel>
                      <TextField label="降車バス停から乗継バス停まで距離(m)" inputRef={transit_distanceRef} defaultValue="300" size="6" inline />
                    
                      <TextField label="乗継時間(分)" inputRef={transit_timeRef} defaultValue="30" inline />
                    
                    </div>}

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap',justifyContent: 'center'}}>
                    <PrimaryButton value="ridingtime" onClick={(e)=>submitbutton(e.target.value)}>所要時間算出</PrimaryButton>
                    <PrimaryButton value="staytime" onClick={(e)=>submitbutton(e.target.value)}>滞在時間算出</PrimaryButton>
                    <PrimaryButton value="fare" onClick={(e)=>submitbutton(e.target.value)}>運賃帯算出</PrimaryButton>
                    <PrimaryButton value="frequency" onClick={(e)=>submitbutton(e.target.value)}>運行本数算出</PrimaryButton>
                  </div>
                </div>

                </form>
                
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>処理中... {progress}%</Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Task ID: {taskId}
            </Typography>
          </Box>
        )}
      </div>
    );
  };
  
  export default ChronogicalImpact;