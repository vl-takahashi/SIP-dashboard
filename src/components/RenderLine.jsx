import React from 'react';
import {createContext, useRef,useState,useEffect} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';

import {useDataStore,useRenderStore,useLoadingStore} from "./useStore";
import { FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";

const RenderLine = () => {

  const filesRef = useRef();
  const agencyRef=useRef();
  const data = useDataStore((state) => state.data);
  const setData = useDataStore((state) => state.setData);
  const setAgency = useDataStore((state) => state.setAgency);
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
  // （以前はconst {rendered,setRendered}=useState(false)という未使用・かつ壊れた変数があったが、
  //   これはローディング表示の下書きだったと思われるためuseLoadingStoreに置き換えた）
  const setLoading = useLoadingStore((state) => state.setLoading);
  let kindset=[];
  const fetchLine= async(formData)=>{
      setLoading(true); // ★ここから応答待ち
      await fetch(`http://52.62.35.205:5000/line`,{
                      
                        method: 'POST',
                        body: formData}) // data.json ファイルを非同期で取得
                        .then(res => 
                        res.json())
                        .then(async (data) => {
                          try{
                            // ★agencyValue をリセット（グルーピングなし）
                            setAgency("");
                            const zip = new JSZip();
                            let dpl=[];
                            let fileCount = 0;
                            console.log(data);
                            for(let d in data.property){

                              console.log(data.property)
                              let dp0="area";
                              console.log(dp0)
                              dpl.push(dp0);
                              let dp1=data.filename[d];
                              let d0=data.data[d];
                              let d001 =data.detail[d];
                              // ★GeoJSON に property フィールドを追加
                              d0.property = dp0;

                              let data_existed=[dp1,true,d0,""];
                              console.log(data_existed,dp0);
                              let d01=JSON.stringify({"property":dp0,"data":d0,"detail":data.property[d],"agency":""}, null, 2);

                              // ★ZIP にファイル追加
                              zip.file(`line_${dp1}_metadata.json`, d01);
                              let geojsonData = JSON.stringify(d0, null, 2);
                              zip.file(`line_${dp1}.geojson`, geojsonData);

                              setData(data_existed,dp);
                              fileCount++;
                           }

                           // ★ZIP を生成してダウンロード
                           const zipBlob = await zip.generateAsync({type: "blob"});
                           const link = document.createElement("a");
                           link.href = URL.createObjectURL(zipBlob);
                           link.download = `line_${new Date().getTime()}.zip`;
                           link.click();

                           const arrayB = Array.from(new Set(dpl));
                            window.alert(`✅ 完了しました。\n✅ ダウンロード: ${fileCount}ファイル\n✅ レイヤー欄にも表示されます。`);
                          } catch(error) {
                            console.error(error);
                          }
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
                
                  try{
                    let formData = new FormData();
                    let file = filesRef.current.files;

                    
                    if (file.length === 0) {
                        
                        console.log('Please select a file first!');
                        return;
                    }
                
                    // 'file' must match the key used in request.files['file'] on the server
                    for (let f=0;f<file.length;f++){
                      formData.append('file', file[f]); 
                        console.log(file[f]);
                
                    }
                    setAgency(agencyRef.current.value);
                    fetchLine(formData);
                    
                  } catch(e) {
                  }
              }}>
                <FileField
                  label="区域・メッシュファイル"
                  required
                  hint="GeoJSON / JSON 形式の区域・メッシュデータを選択してください（複数選択可）。"
                  inputRef={filesRef}
                  accept=".geojson,.json"
                  multiple
                />
                    
                <TextField label="グルーピング名称（任意）" inputRef={agencyRef} inline />
                <PrimaryButton>アップロード</PrimaryButton>
            </form>
          </div>
    );
  };


export default RenderLine;
