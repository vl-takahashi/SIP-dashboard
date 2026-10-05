import React from 'react';
import {createContext, useContext,useState,useRef} from 'react'
import {useDataStore,useDestStore} from "./useStore";


// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
  const FrequencyImpact = () => {
    const setDest = useDestStore((state)=>state.setDest);
    const setWeekday = useWeekdayStore((state)=>state.setWeekday);
    const destfileRef = useRef();
    const destRef = useRef();
    const interval_hmRef = useRef();
    const transitRef = useRef();
    const transit_timeRef = useRef();
    const transit_distanceRef = useRef();
    const fileRef = useRef();
    const impactcodefilesRef = useRef();
    const meter1Ref = useRef();
    const meter2Ref = useRef();

    const setData =useDataStore((state) => state.setData);
    const fetchFrequencyImpactAsync = async (formData) => {
    let data_existed={};
    await fetch(`https://www.vl-sip/module/frequency_impact`,{
                          method:"POST",
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                          res.json())
                          .then(data => {
                            let meter0 = parseInt(meter1Ref.current.value);
                            console.log(meter0);
                            let dp0=`Frequencybuffer`;
                            let dp1=`Frequencybuffer_${meter0}.json`;
                            console.log(dp0);
                            data_existed[dp0]=[`${destRef.current.value}着_frequency`,true,data.data];
                            console.log(data_existed);
                            let d001=JSON.stringify(data);
                            let blob1 = new Blob([d001], { type: "application/json" });
                            const link1 = document.createElement("a");
                            link1.href = URL.createObjectURL(blob1);
                            link1.download = dp1; // 保存するファイル名
                            link1.click(); // クリックしてダウンロード
                            let blob2 = new Blob([d001], { type: "application/geojson" });
                            const link2 = document.createElement("a");
                            link2.href = URL.createObjectURL(blob2);
                            setWeekday(data.weekday);
                            let dp2=`Frequencybuffer_${meter0}.geojson`;
                            link2.download = dp2; // 保存するファイル名
                       帯
                            setData(data_existed,dp0);
                          })
                          .catch(error => {
                            console.log(error);
                              //modalDialog.close();
                          });
                        };
    return (
        <div className='Frequency_impact'>
          <details>
            <summary>運行本数</summary>
              <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
                e.preventDefault(); // リロード防止
                const formData = new FormData();
                try{
                  let file = fileRef.current.files;
                  let impactcodefile = impactcodefilesRef.current.files;
                  let destr = destRef.current.value;
                  console.log(destr);
                  let destfiler = destfileRef.current.files;
                  let interval_hm = interval_hmRef.current.value;
                  let meter1 = meter1Ref.current.value;
              
                  console.log(file);
                  // 'file' must match the key used in request.files['file'] on the server
                    for (const f of file){
                      console.log(f);
                      formData.append('file', f); 
                
                    }
                  // 'file' must match the key used in request.files['file'] on the server
                  for (const f of impactcodefile){
                    formData.append('impactcode', f); 
              
                  }
                  console.log("1");
                  if (destfileRef.length>0) {
                    // 'file' must match the key used in request.files['file'] on the server
                    for (const f of destfiler){
                      formData.append('destfiles', f); 
                      formData.append('meter1', meter1); 
                
                    }

                  } else {

                    formData.append('dest', destr);
                    setDest(destr);
                    formData.append('meter1', meter1);
                  }
                  console.log("3");
                  console.log(formData);
                  formData.append('interval_hm', interval_hm); 
                  for (let value of formData.entries()) { 
                      console.log(value); 
                  }
                  fetchFrequencyImpactAsync(formData);
                } catch(e) {
                  console.log(e.message);
                }
                }}>
                <ul>
                  <li>施設名のみがA列に入ったxlsxからそれぞれの施設最寄りバス停・駅までの運行本数を時間帯別に算出したいとき
                  <input type="file" ref={destfileRef}/></li>
                  <li>1つの目的地最寄りバス停・駅までの運行本数を時間帯別に算出したいとき
                  <input type="text" ref={destRef} value="JR西条駅"/></li>

                </ul>
                <label>施設から最寄り駅・バス停までの距離<input type="text" value="300" size="4" ref={meter1Ref}/></label>m
                <p>gtfsのzip</p>
                <p id="stop_times">ここにファイルをドロップしてください</p>
                <input type="file" ref={fileRef} accept='.zip'/>
                <br></br>
                <p>空間的空白算出で出力されたファイル</p>
                <p id="impact">ここにファイルをドロップしてください（複数ファイル可）</p>
                <input type="file" multiple="multiple" ref={impactcodefilesRef}/>
                <br></br>
                <button type="submit" value="運行本数算出">運行本数算出</button>
              
                
                </form>
                
            </details>
          </div>
        )
      }

export default FrequencyImpact;