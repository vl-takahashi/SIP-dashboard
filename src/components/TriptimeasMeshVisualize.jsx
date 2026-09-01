import React from 'react';
import {createContext, useContext,useState,useRef,useEffect} from 'react'
import {useDataStore,useLoadingStore} from "./useStore";
import { FileField, TextField, PrimaryButton } from "./VisualizeUI";

// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
const TriptimeasMeshVisualize = () => {
    const destlatRef = useRef();
    const shochiikifilesRef = useRef();
    const origlonRef=useRef(null);
    const meterRef = useRef(null);
    const keycodeRef = useRef(null);
    const stopfilesRef = useRef();
    const popmeshfilesRef = useRef();
    const origlatRef = useRef(null);
    const destlonRef=useRef(null);
    const orignameRef=useRef(null);
    const destnameRef=useRef(null);
    const modeRef=useRef(null);
    const origtimeRef=useRef(null);
    const desttimeRef=useRef(null);
    const submitRef=useRef(null);
    const legendRef=useRef(null);
    const [submit,setSubmit]=useState("");
    const setData =useDataStore((state) => state.setData);
    // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
    const setLoading = useLoadingStore((state) => state.setLoading);
    const fetchSpatialImpactAsync = async (formData) => {
    let d001=[];
    let data_existed={};
    setLoading(true); // ★ここから応答待ち
    await fetch(`http://52.62.35.205:5000/odtime_mesh`,{
                          method:"POST",
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                            res.json())
                          .then(data => {
                            let name=legendRef.current.value;
                            let dp0=`odtime_${submit}_mesh`;
                            let dp1=`odtime_${submit}_${name}_mesh.json`;
                            console.log(dp0);
                            data_existed[dp0]=[destlonRef.current.value,true,data];
                            console.log(data_existed);
                            let d001=JSON.stringify({"property":`odtime_${submit}_mesh`,"detail":`${name}`,"data":data,"kind":dp0});
                            let blob1 = new Blob([d001], { type: "application/json" });
                            const link1 = document.createElement("a");
                            link1.href = URL.createObjectURL(blob1);
                            link1.download = dp1; // 保存するファイル名
                            link1.click(); // クリックしてダウンロード

                            let d0001=JSON.stringify(data);
                            let blob2 = new Blob([d0001], { type: "application/geojson" });
                            const link2 = document.createElement("a");
                            link2.href = URL.createObjectURL(blob2);
                            let dp2=`odtime_${submit}_mesh.geojson`;
                            link2.download = dp2; // 保存するファイル名
                            link2.click(); // クリックしてダウンロード
                            setData(data_existed,dp0);

                          })
                          .catch(error => {
                            console.log(error);
                              //modalDialog.close();
                          })
                          .finally(() => setLoading(false)); // ★成功・失敗どちらでも必ず解除
                        };
    return (
        <div className='TriptimeasMeshVisualize'>
            <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
                e.preventDefault(); // リロード防止
                const formData = new FormData();
                try{
                  let bus_stop2file = stopfilesRef.current.files;
                  let popmeshfile = popmeshfilesRef.current.files;
              

                  console.log(bus_stop2file);
                  console.log(popmeshfile);
                  
                  if (bus_stop2file.length === 0&&popmeshfile.length === 0) {
                      
                      console.log('Please select a file first!');
                      return;
                  }
              
                  // 'file' must match the key used in request.files['file'] on the server
                  for (const f of bus_stop2file){
                    formData.append('latlonfile', f); 
              
                  }
                  // 'file' must match the key used in request.files['file'] on the server
                  for (const f of popmeshfile){
                    formData.append('mesh_shpfile', f); 
              
                  }
                  let destlat = destlatRef.current.value;
                  let origlat = origlatRef.current.value;
                  let destlon=destlonRef.current.value;
                  let origlon = origlonRef.current.value
                  let origtime=origtimeRef.current.value;
                  formData.append('dest_lat', destlat); 
                  formData.append('dest_lon', destlon);
                  formData.append('orig_lat', origlat); 
                  formData.append('orig_lon', origlon); 
                  formData.append('mesh_dest_time', origtime); 
                  formData.append('submit', "dest"); 
                  for (let value of formData.entries()) { 
                      console.log(value); 
                  }
                  fetchSpatialImpactAsync(formData);
                } catch(e) {
                  console.log(e.message);
                }
              }}>
                <FileField
                  label="ODの入ったCSV"
                  required
                  hint="csvを選択してください。"
                  inputRef={stopfilesRef}
                  accept=".csv"
                />
                <FileField
                  label="人口メッシュ"
                  required
                  hint="geojsonを選択してください。"
                  inputRef={popmeshfilesRef}
                  accept=".geojson"
                />
                
                <TextField label="乗車地の緯度" inputRef={origlatRef} defaultValue="trips_start_lat" inline />
                <TextField label="乗車地の経度" inputRef={origlonRef} defaultValue="trips_start_lon" inline />
                <TextField label="降車地の緯度" inputRef={destlatRef} defaultValue="trips_end_lat" inline />
                <TextField label="降車地の経度" inputRef={destlonRef} defaultValue="trips_end_lon" inline />
                <TextField label="乗車地の名前" inputRef={orignameRef} defaultValue="start_at_address" inline />
                <TextField label="降車地の名前" inputRef={destnameRef} defaultValue="end_at_address" inline />
                <TextField label="凡例名" inputRef={legendRef} defaultValue="end_at_city" inline />
                <TextField label="乗車/降車時間帯" inputRef={origtimeRef} defaultValue="trips_arr_time" inline />
                
                <PrimaryButton name="submit" id="submit_od_at_orig" value="orig" inputref={submitRef} onClick={(e)=>setSubmit("orig")}>出発時間帯別算出</PrimaryButton>
                <PrimaryButton name="submit" id="submit_od_at_dest" value="dest" inputref={submitRef} onClick={(e)=>setSubmit("dest")}>到着時間帯別算出</PrimaryButton>
            </form>
        </div>
    )};

export default TriptimeasMeshVisualize;