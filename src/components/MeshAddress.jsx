import React from 'react';
import {createContext, useContext,useState,useEffect,useRef} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useDataStore,useAreaStore,useRenderStore,useLoadingStore,useMeshidStore,useAddressStore} from "./useStore";
import { FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";



const MeshAddress = (props) => {
  const cityRef = useRef();
  const popmeshfilesRef = useRef();
  const kisomeshfilesRef = useRef();
  const addressRef = useRef();
  const popmeshidRef = useRef();
  const dimentionRef = useRef();
  const setArea = useAreaStore((state) => state.setArea);
  const setAddress=useAddressStore((state)=>state.selectAddress);
  const setMesh=useMeshidStore((state)=>state.setMesh);
  const [key_code, setKeycode] = useState('');
  const [dimention, setDimention] = useState('');
  const [kisoMeshColumns, setKisoMeshColumns] = useState([]);
  const [selectedMeshId, setSelectedMeshId] = useState('MESH_ID');
  const [columnName,setColumnNames]=useState([]);
  const [selectedMesh, setSelectedMesh] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [popMeshColumns,setPopMeshColumns] = useState([]);
    const dataStore = useDataStore((state) => state);
  let data_existed=[];
  let kindset=[];
  const extractColumnNames = async (file) => {
    try {
      const geojson = JSON.parse(await file.text());
      console.log(geojson);
      if (geojson.features && geojson.features.length > 0) {
        const firstFeature = geojson.features[0];
        const cols = Object.keys(firstFeature.properties || {});
        setColumnNames(cols);
        console.log('Extracted columns:', cols);
        return cols
      }
    } catch (error) {
      console.error('Error extracting columns:', error);
      return error
    }
  };

  // 地域区分ファイル選択イベント
  const handleKisoMeshFileChange = async (e) => {
    const files = kisomeshfilesRef.current?.files;
    if (files && files.length > 0) {
      const cols = await extractColumnNames(files[0]);
      console.log(cols)
      setKisoMeshColumns(cols);
      console.log('Kiso mesh columns:', cols);
    }
  };
    const popmesh = dataStore.data["area"] || [];
    useEffect(()=>{
      (async () => {
    if (popmesh!=[]){
      
      // 全表示メッシュの features を統合
      const allFeatures = [];
      for (const [name, visible, geojson] of popmesh) {
        if (!visible) continue;
        if (geojson?.features) {
          allFeatures.push(...geojson.features);
        }
      }

      // 統合されたGeoJSONを作成
      const meshGeoJSON = {
        type: "FeatureCollection",
        features: allFeatures
      };
      const firstFeature = meshGeoJSON.features[0];
      const cols = Object.keys(firstFeature.properties || {});
      setColumnNames(cols);
      console.log('Extracted columns:', cols);
      setPopMeshColumns(cols);
    }
    })();
  },[]);
  const fileRef = useRef();
   const meshfileRef = useRef();
   const agencyRef = useRef();
 
   const setData = useDataStore((state) => state.setData);
   const setAgency = useDataStore((state) => state.setAgency);
   const setLoading = useLoadingStore((state) => state.setLoading);
 
   const [taskId, setTaskId] = useState(null);
   const [progress, setProgress] = useState(0);
   const [error, setError] = useState(null);
 
   const API_BASE = 'https://vl-sip.com/module';
   const API_ENDPOINT = 'mesh_with_address';
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
         let dp0 = 'mesh_address';
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
 
       if (meshfileRef.current?.files) {
         for (let f of meshfileRef.current.files) {
           formData.append('mesh_file', f);
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
             label="アドレスファイル"
             required
             hint="処理対象のファイルを選択してください（複数選択可）。"
             inputRef={fileRef}
             accept=".geojson,.json,.csv,.zip"
             multiple
           />
           <FileField
             label="メッシュファイル"
             inputRef={meshfileRef}
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
 
 export default MeshAddress;
 