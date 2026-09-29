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
    const agencyRef=useRef(null);
    const dataStore = useDataStore((state) => state);  // ★ ここで dataStore を取得
    const setData =useDataStore((state) => state.setData);
    const setAgency = useDataStore((state) => state.setAgency);
    // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
    const setLoading = useLoadingStore((state) => state.setLoading);

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
    const fetchSpatialImpactAsync = async (formData) => {
    let d001=[];
    let data_existed=[];
    setLoading(true); // ★ここから応答待ち
    await fetch(`http://52.62.35.205:5000/spatial_impact`,{
                          method:"POST",
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                            res.json())
                          .then(async (data) => {
                            // ★agencyValue を保存
                            setAgency(agencyValue);
                            const zip = new JSZip();
                            let meter0 = parseInt(meterRef.current.value);
                            console.log(meter0);
                            let dp0=`spatialbuffer`;
                            let city=cityRef.current.value
                            let agency=agencyRef.current.value
                            const files = popmeshfilesRef.current?.files[0].name.split('.').slice(0, -1);
                            console.log(dp0);
                            data_existed={"detail":`${city}_${dimentionRef.current.value}_${agencyValue}`,"checked":true,"data":data.data};
                            console.log(data_existed);
                            let d001=JSON.stringify({"property":"spatialbuffer","detail":`${city}_${dimentionRef.current.value}_${agencyValue}`,"data":data.data,"kind":dp0,"agency":agencyValue}, null, 2);
                            // ★ZIP にファイル追加
                            let d002=JSON.stringify(data.data, null, 2);
                            setData(data_existed,dp0);
                            const metadataBlob1 = new Blob([d001], { type: 'application/json' });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(metadataBlob1);
                            link.download = `spatialbuffer_${meter0}_${agency}.json`;
                            link.click();
                            const metadataBlob2 = new Blob([d002], { type: 'application/json' });
                            const link2 = document.createElement("a");
                            link2.href = URL.createObjectURL(metadataBlob2);
                            link2.download = `spatialbuffer_${meter0}_${agency}.json`;
                            link2.click();
                          })
                          .catch(error => {
                            console.log(error);
                              //modalDialog.close();
                          })
                          .finally(() => setLoading(false)); // ★成功・失敗どちらでも必ず解除
                        };
    return (
        <div className='spatial_impact'>
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
              
                  // 'file' must match the key used in request.files['file'] on the server
                  for (const f of bus_stop2file){
                    formData.append('stopfl', f); 
              
                  }
                  let meter = meterRef.current.value;
                  let agency=agencyRef.current.value;
                  formData.append('meter', meter);
                  console.log(formData);

                  // ★ 表示メッシュをGeoJSONで統合して送信
                  const popmesh = dataStore.data["popmesh"] || [];

                  // 全表示メッシュの features を統合

                  // メッシュID を抽出
                  const meshIds = [];
                  for (const [name, visible, geojson] of popmesh) {
                    if (!visible) continue;
                    if (geojson?.features) {
                      for (const feature of geojson.features) {
                        const meshId = feature.properties?.MESH_ID || feature.properties?.KEY_CODE;
                        if (meshId) {
                          meshIds.push(meshId);
                        }
                      }
                    }
                  }

                  console.log('✅ メッシュID 抽出:', {
                    meshIdCount: meshIds.length,
                    sampleIds: meshIds.slice(0, 5)
                  });

                  // メッシュID を元のキー名で送信
                  formData.append('meshdf', JSON.stringify(meshIds));
                  console.log(`✓ 表示メッシュを統合: ${allFeatures.length} 個のFeature`);

                  formData.append('agency', agency); 
                  for (let value of formData.entries()) { 
                      console.log(value); 
                  }
                  fetchSpatialImpactAsync(formData);
                } catch(e) {
                  console.log(e.message);
                }
              }}>
                <FileField
                  label="GTFS(zip)"
                  required
                  hint="バス停・便データ（GTFS zip）を選択してください。"
                  inputRef={stopfilesRef}
                  accept=".zip"
                  onChange={handleGtfsZipChange}
                />
                <TextField label="メッシュ単位(m)" inputRef={dimentionRef} defaultValue="250" size="20" inline />
                {agencyOptions.length > 0 ? (
                  <SelectField
                    label="事業者"
                    selectRef={agencyRef}
                    value={agencyValue}
                    inline
                  >
                    {agencyOptions.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </SelectField>
                ) : (
                  <TextField label="事業者" inputRef={agencyRef} placeholder="GTFS(zip)選択後に自動候補が出ます。出ない場合は入力してください" inline />
                )}
                
                <TextField label="圏域(m)" inputRef={meterRef} defaultValue="300" size="20" type="number" inline />
                <PrimaryButton name="submit" id="submit_spatial">空間的圏域算出</PrimaryButton>
            </form>
        </div>
    )};

export default SpatialImpact;