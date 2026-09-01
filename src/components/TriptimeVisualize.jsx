import React from 'react';
import {createContext, useContext,useState,useRef,useEffect} from 'react'
import {useDataStore,useLoadingStore} from "./useStore";
import { FileField, TextField, PrimaryButton } from "./VisualizeUI";

// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
const TriptimeVisualize = () => {
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
    const origtimeRef=useRef(null)
    const desttimeRef=useRef(null)
        const [submit,setSubmit]=useState("");
    const setData =useDataStore((state) => state.setData);
    // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
    const setLoading = useLoadingStore((state) => state.setLoading);
    const fetchtOdtimepassImpactAsync = async (formData) => {
    
    let d001=[];
    let data_existed={};
    setLoading(true); // ★ここから応答待ち
    await fetch(`http://52.62.35.205:5000/${submit}`,{
                          method:"POST",
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                            res.json())
                          .then(data => {
                            let meter0 = parseInt(meterRef.current.value);
                            console.log(meter0);
                            let dp0=`odtime_visual`;
                            let dp1=`odtime_visual_${meter0}_${text}.json`;
                            console.log(dp0);
                            data_existed[dp0]=[destlonRef.current.value,true,data.data];
                            console.log(data_existed);
                            let d001=JSON.stringify({"property":"odtime_visual","detail":`${meter0}_${destlatRef.current.value}`,"data":data.data,"kind":dp0});
                            let blob1 = new Blob([d001], { type: "application/json" });
                            const link1 = document.createElement("a");
                            link1.href = URL.createObjectURL(blob1);
                            link1.download = dp1; // 保存するファイル名
                            link1.click(); // クリックしてダウンロード

                            let blob2 = new Blob([d001], { type: "application/geojson" });
                            const link2 = document.createElement("a");
                            link2.href = URL.createObjectURL(blob2);
                            let dp2=`odtime_visual_${meter0}_${destlonRef.current.value}.geojson`;
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
        <div className='TriptimeVisualize'>
            <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
                e.preventDefault(); // リロード防止
                const formData = new FormData();
                try{
                  let bus_stop2file = stopfilesRef.current.files;
              

                  console.log(bus_stop2file);
                  if (bus_stop2file.length === 0) {
                      
                      console.log('Please select a file first!');
                      return;
                  }
              
                  console.log(origlatRef.current.value);
                  let destlat = destlatRef.current.value;
                  let origlat = origlatRef.current.value;
                  let destlon=destlonRef.current.value;
                  let origlon = origlonRef.current.value
                  let travelmode=modeRef.current.value;
                  let origtime=origtimeRef.current.value;
                  let desttime=desttimeRef.current.value;
                  console.log(desttime);
                  formData.append('dest_lat', destlat); 
                  formData.append('dest_lon', destlon);
                  formData.append('orig_lat', origlat); 
                  formData.append('orig_lon', origlon); 
                  formData.append('travelmode', travelmode); 
                  formData.append('orig_time', origtime); 
                  formData.append('dest_time', desttime); 
                  console.log(formData);
                  for (let value of formData.entries()) { 
                      console.log(value); 
                  }
                  fetchtOdtimepassImpactAsync(formData);
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
                <TextField label="交通手段(任意)" inputRef={modeRef} inline />
                <p>乗車時間帯か降車時間帯どちらかを入力してください。</p>
                <TextField label="乗車時間帯" inputRef={origtimeRef} inline />
                <TextField label="降車時間帯" inputRef={desttimeRef} inline />
                
                <PrimaryButton name="submit" id="submit_od">時間帯別に算出</PrimaryButton>
            </form>
        </div>
    )};

export default TriptimeVisualize;