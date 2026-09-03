import React from 'react';
import {createContext, useRef,useState,useEffect} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import JSZip from 'jszip';

import {useDataStore,useRenderStore,useLoadingStore} from "./useStore";
import { FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";


const RenderStop = () => {
  const filesRef = useRef();
  const data = useDataStore((state) => state.data);
  const setData = useDataStore((state) => state.setData);
  const setCheck = useDataStore((state) => state.setCheck);
  const setAgency = useDataStore((state) => state.setAgency);
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
  const setLoading = useLoadingStore((state) => state.setLoading);
  let kindset=[];
  const cityRef=useRef();
  const agencyRef=useRef(null);

  // ★公共交通の種類（kindValue）
  const [kindValue, setKindValue] = useState("");
  const kindOptions=["駅","停留所(バス)","停留所(路面電車)","シェアリングポート","駐輪場","駐車場"];
  const kindOptions0={"駅":"station","停留所(バス)":"busstop","停留所(路面電車)":"tramstop","シェアリングポート":"shareport","駐輪場":"cycleparking","駐車場":"carparking"};

  // ★事業者（agencyValue）の自動候補
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [agencyValue, setAgencyValue] = useState("");

  // ★GTFS から agency.txt を解析して事業者候補を取得
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

  const handleGtfsZipChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const zip = await JSZip.loadAsync(file);
      const agencyEntry = Object.values(zip.files).find((f) =>
        f.name.toLowerCase().endsWith("agency.txt")
      );
      if (!agencyEntry) {
        console.log("agency.txtが見つかりません。手入力に切り替えます。");
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
        console.log("agency_name列が見つかりません。");
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
      console.log("GTFS の事業者名自動検出に失敗:", err.message);
      setAgencyOptions([]);
    }
  };

  const fetchStop= async(formData)=>{
      setLoading(true); // ★ここから応答待ち
      await fetch(`http://52.62.35.205:5000/gtfs_point`,{
                      
                        method: 'POST',
                        body: formData}) // data.json ファイルを非同期で取得
                        .then(res => 
                        res.json())
                        .then(async (responseData) => {
                          try{
                            const zip = new JSZip();
                            let fileCount = 0;
;
                            let filename=filesRef.current.files[0].name.split(".")[0];
                            // ★agencyValue を保存
                            setAgency(agencyValue);
                            // ★API レスポンスを ZIP に格納
                            for (const value of responseData) {
                              // ★GeoJSON に property フィールドを追加
                              value.property = kindOptions0[kindValue];

                              let data_existed = [filename, true, value, agencyValue];
                              setData(data_existed, kindValue);
                              console.log(kindValue)
                              // ZIP に追加
                              let geojsonData = JSON.stringify(value, null, 2);
                              zip.file(`route_${cityRef.current.value}.geojson`, geojsonData);

                              let metadata = {
                                "property": kindValue,
                                "data": value,
                                "detail": filename,
                                "agency": agencyValue
                              };
                              let jsonData = JSON.stringify(metadata, null, 2);
                              // ★JSON を ZIP に追加
                              zip.file(`stop_${filename}_${kindOptions0[kindValue]}.json`, jsonData);

                              fileCount++;
                            }

                            // ZIP を生成してダウンロード
                            const blob = await zip.generateAsync({type: "blob"});
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = `${kindValue}_${agencyValue}_stops.zip`;
                            link.click();

                            window.alert(`✅ 完了しました。\n✅ ダウンロード: ${fileCount}ファイル\n✅ レイヤー欄にも表示されます。`);
                            console.log(`✅ API レスポンス: ${fileCount} 件を setData に格納 + ZIP ダウンロード`);
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
          <div style={{padding:"20px"}}>

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
                    formData.append("kind",cityRef.current.value);
                    formData.append("name", agencyValue);
                    fetchStop(formData);

                  } catch(e) {
                  }
              }}>
                <FileField
                  label="GTFSファイル"
                  required
                  hint="GTFS（路線・便）データを選択してください（複数選択可）。"
                  inputRef={filesRef}
                  accept=".zip,.txt,.csv"
                  multiple
                  onChange={handleGtfsZipChange}
                />

                <SelectField
                  label="公共交通の種類（鉄軌道、バス）"
                  selectRef={cityRef}
                  value={kindValue}
                  onChange={(e) => setKindValue(e.target.value)}
                  inline
                >
                  <option value="">選択してください</option>
                  {kindOptions.map((k) => (
                    <option key={k} value={kindOptions0[k]}>{k}</option>
                  ))}
                </SelectField>

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
                  <TextField label="事業者" inputRef={agencyRef} placeholder="GTFS選択後に自動候補が出ます。出ない場合は入力してください" inline />
                )}

                <PrimaryButton>アップロード</PrimaryButton>
            </form>

          </div>
    );
  };


export default RenderStop;
