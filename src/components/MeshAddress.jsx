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
  const setData = useDataStore((state) => state.setData);
  const setAddress=useAddressStore((state)=>state.selectAddress);
  const setMesh=useMeshidStore((state)=>state.setMesh);
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
  const setLoading = useLoadingStore((state) => state.setLoading);
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
      const geojson = JSON.parse(await file.text()).data;
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
      console.log(meshGeoJSON.features);
      const firstFeature = meshGeoJSON.features[0];
      const cols = Object.keys(firstFeature.properties || {});
      //setColumnNames(cols);
      console.log('Extracted columns:', cols);
      setPopMeshColumns(cols);
    }
    })();
  },[]);
  const makemesh= async(formData)=>{
      setLoading(true); // ★ここから応答待ち
      await fetch(`http://52.62.35.205:5000/mesh_with_address`,{
                          method:"POST",
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                          res.json())
                          .then(data => {
                            let meter0 = parseInt(dimentionRef.current.value);
                            let city0 = cityRef.current.value;
                            let address = selectedAddress;
                            let dp0="addressed";
                            let dp1=`popmesh_${meter0}_${city0}_addressed.json`;
                            console.log(dp0);
                            data_existed[dp0]=[`${meter0}_${city0}_addressed`,true,data.data];
                            console.log(data_existed);
                            let d001=JSON.stringify({"property":"addressed","data":data.data,"address":address,"area":data.area,"detail":`popmesh_${meter0}_${city0}_addressed`});
                            let blob1 = new Blob([d001], { type: "application/json" });
                            const link1 = document.createElement("a");
                            link1.href = URL.createObjectURL(blob1);
                            link1.download = dp1; // 保存するファイル名
                            link1.click(); // クリックしてダウンロード
                            let d002=JSON.stringify(data.data);
                            let blob2 = new Blob([d002], { type: "application/geojson" });
                            const link2 = document.createElement("a");
                            link2.href = URL.createObjectURL(blob2);
                            let dp2=`popmesh_${meter0}_${city0}_addressed.geojson`;
                            link2.download = dp2; // 保存するファイル名
                            link2.click(); // クリックしてダウンロード
                            const Popcode=popmeshidRef.current.value;
                            setAddress(Popcode);
                            setMesh(selectedMesh);
                            setArea(data.area);
                          })
                          .catch(error => {
                            console.log(error);
                              //modalDialog.close();
                          })
                          .finally(() => setLoading(false)); // ★成功・失敗どちらでも必ず解除
                        };
    
     
    return (
          <div>
              <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
                  e.preventDefault(); // リロード防止
                  const formData = new FormData();
                  try{
                    let kisomeshfile = kisomeshfilesRef.current.files;
                
                    
              
                  // ★ 表示メッシュをGeoJSONで統合して送信
                    const popmesh = dataStore.data["popmesh"] || [];

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
                    const metadataBlob1 = new Blob([JSON.stringify(meshGeoJSON)], { type: 'application/json' });
                    formData.append('popmeshid', selectedMesh);
                    formData.append('meshdf', metadataBlob1);
                    console.log(formData);
                    // 'file' must match the key used in request.files['file'] on the server
                    for (const f of kisomeshfile){
                      formData.append('kisomesh', f); 
                
                    }
                    console.log(formData);
                    let addressid = selectedAddress;
                    formData.append('addressid', addressid);
                    for (let value of formData.entries()) { 
                        console.log(value); 
                    }
                    console.log("address")
                    makemesh(formData);
                  } catch(e) {
                    console.log(e.message);
                  }
                }}>
                  <FileField
                    label="地域区分ファイル(GeoJSON)"
                    hint="住所・地域区分を含むGeoJSONファイルを選択してください。"
                    inputRef={kisomeshfilesRef}
                    accept=".geojson"
                    onChange={handleKisoMeshFileChange}
                  />
                  <SelectField
                    label="住所列名"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    inline
                  >
                    {kisoMeshColumns.length > 0 ? (
                      kisoMeshColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))
                    ) : (
                      <option value="市区町村">市区町村</option>
                    )}
                  </SelectField>
                  <SelectField
                    label="表示人口メッシュのメッシュコード列名"
                    value={selectedMesh}
                    onChange={(e) => setSelectedMesh(e.target.value)}
                    inline
                  >
                    {
                      popMeshColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                  </SelectField>
                  <TextField label="市区町村名" inputRef={cityRef} defaultValue="広島県東広島市" inline />
                  <TextField label="上記ファイルのメッシュ単位(m)" inputRef={dimentionRef} defaultValue="250" inline />

                  <PrimaryButton>メッシュ住所追加</PrimaryButton>
              </form>
          </div>
    )};


export default MeshAddress;
