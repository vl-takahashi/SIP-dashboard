import React from 'react';
import {createContext, useContext,useState,useEffect,useRef} from 'react'
import {useDataStore,useDestStore,useWeekdayStore,useLoadingStore} from "./useStore";
import { FileField, TextField, PrimaryButton } from "./VisualizeUI";
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
let data_existed={};
const LiptRender = () => {
    const setData =useDataStore((state) => state.setData);
    // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
    const setLoading = useLoadingStore((state) => state.setLoading);
    const gtfsRef = useRef();
    const muniRef = useRef();
    //CSVファイルを読み込む関数getCSV()の定義
    const Liptfetch = async(formData) => {
      try{
         console.log("success")
         setLoading(true); // ★ここから応答待ち

          await fetch("http://52.62.35.205:5000/lipt",{
                                    method: 'POST',
                                    body:formData
                                  }) // data.json ファイルを非同期で取得
                                    .then(res => 
                                      res.json())
                                    .then(data => {
                                    // 4. JSONデータ（JavaScriptオブジェクト）を受け取る
                                    
                                    let dp0="lipt";
                                    let dp1=`lipt_${muniRef.current.value}.json`;
                                    console.log(dp0);
                                    let data_existed=[dp0,true,data.data];
                                    console.log(data_existed);
                                    let d001=JSON.stringify({"property":dp0,"detail":muniRef.current.value,"data":data.data});
                                    let blob1 = new Blob([d001], { type: "application/json" });
                                    const link1 = document.createElement("a");
                                    link1.href = URL.createObjectURL(blob1);
                                    link1.download = dp1; // 保存するファイル名
                                    link1.click(); // クリックしてダウンロード
                                    let blob2 = new Blob([data], { type: "application/geojson" });
                                    const link2 = document.createElement("a");
                                    link2.href = URL.createObjectURL(blob2);
                                    let dp2=`lipt_${muniRef.current.value}.geojson`;
                                    link2.download = dp2; // 保存するファイル名
                                    link2.click(); // クリックしてダウンロード
                                    setData(data_existed,dp0);
                                  }
                                  ).catch(err=>console.log(err))
                                  .finally(() => setLoading(false)); // ★成功・失敗どちらでも必ず解除


          console.log("lipt");
        } catch{
          setLoading(false); // ★fetchに到達する前に例外が起きた場合の解除
        }
    }
    return (
      
        <div className="lipt_select">
          <h2>Lipt</h2>
          <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData();
            try{
            let file = gtfsRef.current.files;
            console.log(file);
              for (let f in file){
                console.log(file[f]);
                formData.append('gtfs', file[f]); 
          
              }
            formData.append('muni',muniRef.current.value);
              for (let value of formData.entries()) { 
                  console.log(value); 
              }
            Liptfetch(formData)
                } catch(e) {
                  console.log(e.message);
                }
                }}>
          <TextField label="市区町村" inputRef={muniRef} placeholder="広島県東広島市" />
          <FileField
            label="GTFSファイル"
            required
            hint="GTFS（路線・便）データを選択してください（複数選択可）。"
            inputRef={gtfsRef}
            accept=".zip"
            multiple
          />
          <PrimaryButton>lipt診断</PrimaryButton>
            
          </form>
          <div className="map"
          style={{
            position: "relative"
          }}>
          </div>
        </div>
    );
  };

export default LiptRender;
