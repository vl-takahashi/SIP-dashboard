import React from 'react';
import {createContext, useContext,useState,useRef,useEffect} from 'react'
import {useDataStore,useLoadingStore} from "./useStore";
import { FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";
import JSZip from "jszip";

// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
const SpatialImpact = () => {
    const cityRef = useRef();
    const shochiikifilesRef = useRef();
    const dimentionRef=useRef(null);
    const meterRef = useRef(null);
    const keycodeRef = useRef(null);
    const stopfilesRef = useRef();
    const popmeshfilesRef = useRef();
    const shicodeRef = useRef(null);
    const [columnNames, setColumnNames] = useState([]);
    const [selectedShicode, setSelectedShicode] = useState('SHICODE');
    let data_existed=[];
    let kindset=[];

    // ファイルの列名を抽出
    const extractColumnNames = async (file) => {
      try {
        const geojson = JSON.parse(await file.text());
        if (geojson.features && geojson.features.length > 0) {
          const firstFeature = geojson.features[0];
          const cols = Object.keys(firstFeature.properties || {});
          setColumnNames(cols);
          console.log('Extracted columns:', cols);
        }
      } catch (error) {
        console.error('Error extracting columns:', error);
      }
    };
    const dataStore = useDataStore((state) => state);  // ★ ここで dataStore を取得

    // ★非専門家向け改善：市町村コード列名(keycode)を手打ちさせず、
    // アップロードされた人口メッシュGeoJSONのproperties列名を自動検出して選択式にする。
    // 「SHICODE」という列名を知らなくても、候補から選ぶだけで済むようにする。
    const [keycodeOptions, setKeycodeOptions] = useState([]);
    const [keycodeValue, setKeycodeValue] = useState("SHICODE");
    const handlePopmeshFileChange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const props = json?.features?.[0]?.properties || {};
        const keys = Object.keys(props);
        setKeycodeOptions(keys);
        // 「SHICODE」が候補にあればそれを初期選択、無ければ候補の先頭を選ぶ
        if (keys.includes("SHICODE")) {
          setKeycodeValue("SHICODE");
        } else if (keys.length > 0) {
          setKeycodeValue(keys[0]);
        }
      } catch (err) {
        // ファイルがGeoJSONとして読めない場合は候補なし（手打りへフォールバック）
        console.log("人口メッシュファイルの列名自動検出に失敗しました:", err.message);
        setKeycodeOptions([]);
      }
    };

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

    // ★非専門家向け改善：事業者名(agency)を手打ちさせず、
    // アップロードされたGTFS(zip)の中のagency.txtを解析して選択式にする。
    // 「agency.txtにagency_name列がある」というGTFS仕様は固定なので自動抽出は比較的安全だが、
    // 万一zipの中身が想定外（agency.txtが無い/読めない）の場合は手打り欄に戻す。
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
    const fileRef = useRef();
      const destfileRef = useRef();
      const agencyRef = useRef();
    
      const setData = useDataStore((state) => state.setData);
      const setAgency = useDataStore((state) => state.setAgency);
      const setLoading = useLoadingStore((state) => state.setLoading);
    
      const [taskId, setTaskId] = useState(null);
      const [progress, setProgress] = useState(0);
      const [error, setError] = useState(null);
    
      const API_BASE = 'https://vl-sip.com/module';
      const API_ENDPOINT = 'spatial_impact';
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
            let dp0 = 'spatial_impact';
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
    
      const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
    
        try {
          let formData = new FormData();
    
          if (fileRef.current?.files) {
            for (let f of fileRef.current.files) {
              formData.append('file', f);
            }
          }
    
          if (destfileRef.current?.files) {
            for (let f of destfileRef.current.files) {
              formData.append('dest_file', f);
            }
          }
    
          if (agencyRef.current?.value) {
            formData.append('agency', agencyRef.current.value);
          }
    
          if (!fileRef.current?.files?.length) {
            setError('ファイルを選択してください');
            return;
          }
    
          fetchDataAsync(formData);
        } catch (err) {
          console.error('Error:', err);
          setError(err.message);
        }
      };
    
      return (
        <div>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!taskId ? (
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <FileField
                label="空間ファイル"
                required
                hint="処理対象のファイルを選択してください（複数選択可）。"
                inputRef={fileRef}
                accept=".geojson,.json,.csv,.zip"
                multiple
              />
              <FileField
                label="目的地ファイル"
                inputRef={destfileRef}
                multiple
              />
              <TextField
                label="グルーピング名称（任意）"
                inputRef={agencyRef}
                inline
              />
              <PrimaryButton disabled={!!taskId}>アップロード</PrimaryButton>
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
    
    export default SpatialImpact;
    