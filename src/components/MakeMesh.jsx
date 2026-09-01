import React from 'react';
import {createContext, useContext,useState,useEffect,useRef} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';

import {useDataStore,useRenderStore,useLoadingStore} from "./useStore";
import { FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";



const MakeMesh = (props) => {
  const agencyRef=useRef();
  const cityRef = useRef();
  const popmeshfilesRef = useRef();
  const shicodeRef = useRef();
  const dimentionRef = useRef();
  const setData = useDataStore((state) => state.setData);
  const setAgency = useDataStore((state) => state.setAgency);
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
  const setLoading = useLoadingStore((state) => state.setLoading);
  const [key_code, setKeycode] = useState('');
  const [dimention, setDimention] = useState('');
  const [columnNames, setColumnNames] = useState([]);
  const [selectedShicode, setSelectedShicode] = useState('上にファイルをアップロードされると列名を選択できます。');
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

  // ファイル選択イベント
  const handleFileChange = async (e) => {
    const files = popmeshfilesRef.current?.files;
    if (files && files.length > 0) {
      await extractColumnNames(files[0]);
    }
  };

  const makemesh= async(formData)=>{
      setLoading(true); // ★ここから応答待ち
      await fetch(`http://52.62.35.205:5000/render_mesh`,{
                          method:"POST",
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                          res.json())
                          .then(async (data) => {
                            // ★agencyValue をリセット（グルーピングなし）
                            setAgency("");
                            let city0 = cityRef.current.value;
                            let meter0 = dimentionRef.current.value;
                            console.log(meter0);
                            let dp0=data.kind;//kind="popmesh"
                            let dp1=`${dp0}_${meter0}_${city0}.json`;
                            console.log(data.detail);//detail="popmesh_dimention_city"
                            data_existed=[data.detail,true,data.data];
                            console.log(data_existed);
                            let d001=JSON.stringify({"property":"popmesh","data":data.data,"detail":`${city0}`,"kind":data.kind,"dimention":meter0}, null, 2);
                            
                            setData(data_existed,dp0);

                            // ファイルダウンロード（JSON + GeoJSON）
                            const metadataLink1 = document.createElement("a");
                            const metadataLink2 = document.createElement("a");
                            const metadataBlob1 = new Blob([d001], { type: 'application/json' });
                            metadataLink1.href = URL.createObjectURL(metadataBlob1);
                            metadataLink1.download = `popmesh_${meter0}_${city0}.json`;
                            metadataLink1.click();
                            console.log("JSON ファイルをダウンロード:", metadataLink1.download);

                            // Blob2: GeoJSON
                            const d002 = JSON.stringify(data.data, null, 2);
                            const metadataBlob2 = new Blob([d002], { type: 'application/json' });
                            metadataLink2.href = URL.createObjectURL(metadataBlob2);
                            metadataLink2.download = `popmesh_${meter0}_${city0}.geojson`;
                            metadataLink2.click();
                            console.log("GeoJSON ファイルをダウンロード:", metadataLink2.download);
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
                    let popmeshfile = popmeshfilesRef.current.files;


                    if (popmeshfile.length === 0) {

                        console.log('Please select a file first!');
                        return;
                    }

                    // 'file' must match the key used in request.files['file'] on the server
                    for (const f of popmeshfile){
                      formData.append('meshdf', f);

                    }
                    let city = cityRef.current.value;
                    let shicode = selectedShicode;
                    console.log( city);
                    formData.append('city', cityRef.current.value);
                    formData.append('dimention',dimentionRef.current.value)
                    formData.append('keycode', shicode);
                    for (let value of formData.entries()) {
                        console.log(value);
                    }
                    setAgency(agencyRef.current.value);
                    makemesh(formData);
                  } catch(e) {
                    console.log(e.message);
                  }
                }}>
                  <FileField
                    label="人口メッシュ統計データ(GeoJSON)"
                    required
                    hint="国土数値情報の人口メッシュ統計GeoJSONファイルを選択してください。"
                    inputRef={popmeshfilesRef}
                    accept=".geojson"
                    onChange={handleFileChange}
                  />
                  <SelectField
                    label="市町村コード列名"
                    value={selectedShicode}
                    onChange={(e) => setSelectedShicode(e.target.value)}
                    inline
                  >
                    {columnNames.length > 0 ? (
                      columnNames.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))
                    ) : (
                      <option value="SHICODE">SHICODE</option>
                    )}
                  </SelectField>
                  <TextField label="市町村名" inputRef={cityRef} placeholder="広島県東広島市" size="40" inline />
                  <TextField label="上記ファイルのメッシュ単位(m)" inputRef={dimentionRef} defaultValue="250" inline />

                <TextField label="グルーピング名称（任意）" inputRef={agencyRef} inline />
                  <PrimaryButton>人口メッシュ表示</PrimaryButton>
              </form>
          </div>
    )};


export default MakeMesh;
