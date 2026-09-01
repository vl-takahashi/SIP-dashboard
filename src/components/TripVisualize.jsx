import React from 'react';
import {createContext, useContext,useState,useRef,useEffect} from 'react'
import {useDataStore,useLoadingStore} from "./useStore";
import { FileField, TextField, PrimaryButton } from "./VisualizeUI";

// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
const TripVisualize = () => {
    const submittimeref=useRef(null);
    const submitref=useRef(null);
    const destlatRef = useRef(null);
    const origlonRef=useRef(null);
    const meterRef = useRef(null);
    const keycodeRef = useRef(null);
    const stopfilesRef = useRef();
    const origlatRef = useRef(null);
    const destlonRef=useRef(null);
    const orignameRef=useRef(null);
    const destnameRef=useRef(null);
    const modeRef=useRef(null);
    const legendRef=useRef(null);
    const origtimeRef=useRef(null);
    const desttimeRef=useRef(null);
    const [submit,setSubmit]=useState("");
    const setData =useDataStore((state) => state.setData);
    // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
    const setLoading = useLoadingStore((state) => state.setLoading);
    const fetchAsync = async (formData) => {
    let d001=[];
    let data_existed={};
    setLoading(true); // ★ここから応答待ち
    const url =`http://52.62.35.205:5000/${submit}`;
    await fetch(`${url}`,{
                          method:"POST",
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                            res.json())
                          .then(data => {
                            let dp0=`${submit}`;
                            let name=legendRef.current.value;
                            let dp1=`${submit}_${name}.json`;
                            console.log(data_existed[dp0]);
                            data_existed[dp0]=[`${name}`,true,data];
                            console.log(data_existed);
                            let d001=JSON.stringify({"property":dp0,"detail":`${name}`,"data":data});
                            let blob1 = new Blob([d001], { type: "application/json" });
                            const link1 = document.createElement("a");
                            link1.href = URL.createObjectURL(blob1);
                            link1.download = dp1; // 保存するファイル名
                            link1.click(); // クリックしてダウンロード

                            let blob2 = new Blob([JSON.stringify(data)], { type: "application/geojson" });
                            const link2 = document.createElement("a");
                            link2.href = URL.createObjectURL(blob2);
                            let dp2=`od_visual_${name}.geojson`;
                            link2.download = dp2; // 保存するファイル名
                            link2.click(); // クリックしてダウンロード
                            setData(data_existed[dp0],dp0);

                          })
                          .catch(error => {
                            console.log(error);
                              //modalDialog.close();
                          })
                          .finally(() => setLoading(false)); // ★成功・失敗どちらでも必ず解除
                        };
    return (
        <div className='TripVisualize'>
            <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
                e.preventDefault(); // リロード防止
                const formData = new FormData();
                try{
                  let bus_stop2file = stopfilesRef.current.files;

                  if (bus_stop2file.length === 0) {
                      
                      console.log('Please select a file first!');
                      return;
                  }
              
                  // 'file' must match the key used in request.files['file'] on the server
                  for (const f of bus_stop2file){
                    formData.append('latlonfile', f); 
              
                  }
                  console.log(origlatRef.current.value);
                  let destlat = destlatRef.current.value;
                  let origlat = origlatRef.current.value;
                  let destlon=destlonRef.current.value;
                  let origlon = origlonRef.current.value
                  let destname=destnameRef.current.value;
                  let origname = orignameRef.current.value
                  let travelmode=modeRef.current.value;
                  let origtime=origtimeRef.current.value;
                  formData.append('dest_lat', destlat); 
                  formData.append('dest_lon', destlon);
                  formData.append('orig_lat', origlat); 
                  formData.append('orig_lon', origlon); 
                  formData.append('origname', origname); 
                  formData.append('destname', destname); 
                  formData.append('travelmode', travelmode); 
                  formData.append('orig_time', origtime); 

                  for (let value of formData.entries()) { 
                      console.log(value); 
                  }
                  console.log(submit);
                  fetchAsync(formData);
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
                <TextField label="乗車地の緯度" inputRef={origlatRef} defaultValue="start_at_city_lat" inline />
                <TextField label="乗車地の経度" inputRef={origlonRef} defaultValue="start_at_city_lon" inline />
                <TextField label="降車地の緯度" inputRef={destlatRef} defaultValue="end_at_city_lat" inline />
                <TextField label="降車地の経度" inputRef={destlonRef} defaultValue="end_at_city_lon" inline />
                <TextField label="乗車地の名前" inputRef={orignameRef} defaultValue="start_at_city" inline />
                <TextField label="降車地の名前" inputRef={destnameRef} defaultValue="end_at_city" inline />
                <TextField label="凡例名" inputRef={legendRef} defaultValue="end_at_city" inline />
                <TextField label="交通手段(任意)" inputRef={modeRef} inline />
                <PrimaryButton name="submit" id="submit_od" value="od_visual" onClick={(e)=>setSubmit("od_visual")}>OD算出</PrimaryButton>
                
                <TextField label="乗車/降車時間帯" inputRef={origtimeRef} defaultValue="trips_arr_time" inline />
                <PrimaryButton name="submit" id="submit_time" value="odtime_visual" onClick={(e)=>setSubmit("odtime_visual")}>時間帯別に算出</PrimaryButton>
                
            </form>
        </div>
    )};

export default TripVisualize;