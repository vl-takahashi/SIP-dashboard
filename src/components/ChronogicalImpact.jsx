import React from 'react';
import {createContext, useContext,useState,useRef} from 'react'
import {useDataStore,useDestStore,useOrigStore,usePooledweekdayStore,useWeekdayStore,useLoadingStore} from "./useStore";
import { FieldLabel, FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";
import { COLORS } from "./Globalvariable";
import JSZip from "jszip";

// import { fetch as tauriFetch } from '@tauri-apps/plugin-http'; // Tauri removed

// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';

// Step区切りのカード風ボックス（各Stepの視覚的まとまりを示す）

// Step区切りのカード風ボックス（各Stepの視覚的まとまりを示す）
const stepBoxStyle = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: '14px 16px',
  marginBottom: 14,
  background: '#FAFAFA',
};
const hintTextStyle = { margin: '4px 0 8px', fontSize: 12, color: COLORS.subtext };

const ChronogicalImpact = () => {
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

  const dest1 = useDestStore((state)=>state.dest);
  const setDirectDest = useDestStore((state)=>state.setDirectdest);
  const setTransitDest = useDestStore((state)=>state.setTransitdest);
  const setDirectOrig = useDestStore((state)=>state.setDirectorig);
  const setTransitOrig = useDestStore((state)=>state.setTransitorig);
  const setWeekday = useWeekdayStore((state)=>state.setWeekday);
  const destfileRef = useRef();
  const destRef = useRef();
  const interval_hmRef = useRef();
  const cityRef = useRef();
  const innerRef = useRef();
  const transitRef = useRef();
  const transit_timeRef = useRef();
  const transit_distanceRef = useRef();
  const fileRef = useRef();
  const popmeshfilesRef = useRef();
  const nearestmeterRef = useRef();
  const meter2Ref = useRef();
  const agencyRef= useRef();
  const originRef=useRef();
  const setDirectdest = useDestStore((state)=>state.setDirectdest);
  const setTransitdest = useDestStore((state)=>state.setTransitdest);
  const setPooledweekday=usePooledweekdayStore((state)=>state.setPooledweekday);
  const dataStore = useDataStore((state) => state);
  const [origincurrent,originSetcurrent]=useState("dest");
  const [directcurrent,setdirectcurrent]=useState("direct");
  const [submit,submitbutton]=useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const setData =useDataStore((state) => state.setData);
  const setAgency = useDataStore((state) => state.setAgency);
  const setinner = useDataStore((state) => state.setinner);
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
  const setLoading = useLoadingStore((state) => state.setLoading);
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
  // ★ 修正：Vercel API ルート経由で診断モジュールを呼び出し
  const fetchChronogicalImpactAsync = async (formData, routingvalue) => {
    let data_existed = [];
    console.log(routingvalue);

    // AWS API Gateway 経由（HTTPS → ECS）
    const baseUrl = 'https://v7eb2nvlnd.execute-api.ap-southeast-2.amazonaws.com';
    const endpoint = routingvalue === "frequency"
      ? "frequency_impact_to_destination_on_route"
      : "chronogical_impact";
    const url = `${baseUrl}/${endpoint}`;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${url}`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API エラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      setAgency("");

      let transit = transitRef.current.value;
      let dest_name = destRef.current.value;
      let dp0 = `${routingvalue}_${transit}_${originRef.current.value}`;

      console.log("API レスポンス:", data);

      data_existed = [`${dest_name}着_${routingvalue}`, true, data, ""];
      if (transit==="direct"){
        originRef.current.value=="dest"?setDirectDest(dest_name):setDirectOrig(dest_name);
      } else {
        originRef.current.value=="dest"?setTransitDest(dest_name):setTransitOrig(dest_name);
      }
      setData(data_existed, dp0);
      setWeekday(data.weekday);
      setPooledweekday(data.weekday);
      // ファイルダウンロード（JSON + GeoJSON）
      const metadataLink1 = document.createElement("a");
      const metadataLink2 = document.createElement("a");
      const d01={
        "property": dp0,
        "detail": `${dest_name}着_${routingvalue}`,
        "data": data.data,
        "interval":data.interval,
        "dest":data.dest,
        "weekday":data.weekday,
        "destpoint":data.point,
        "inner":innerRef.current.value
      }
      const o01={
        "property": dp0,
        "detail": `${dest_name}着_${routingvalue}`,
        "data": data.data,
        "interval":data.interval,
        "orig":data.orig,
        "weekday":data.weekday,
        "destpoint":data.point,
        "inner":innerRef.current.value
      }
      // Blob1: JSON メタデータ
      const d001 = JSON.stringify(originRef.current.value=="dest"?d01:o01, null, 2);

      const metadataBlob1 = new Blob([d001], { type: 'application/json' });
      metadataLink1.href = URL.createObjectURL(metadataBlob1);
      metadataLink1.download = `chronogical_${routingvalue}_${transit}_${data.orig}_${dest_name}.json`;
      metadataLink1.click();
      console.log("JSON ファイルをダウンロード:", metadataLink1.download);

      //const d002 = JSON.stringify(data.file, null, 2);
      //const metadataBlob2 = new Blob([d002], { type: 'application/json' });
      //metadataLink2.href = URL.createObjectURL(metadataBlob2);
      //metadataLink2.download = `chronogical_${routingvalue}_${transit}_${data.orig}_${dest_name}.geojson`;
      //metadataLink2.click();

      // メモリリーク防止
      setTimeout(() => {
        URL.revokeObjectURL(metadataLink1.href);
        URL.revokeObjectURL(metadataLink2.href);
      }, 1000);

    } catch (error) {
      console.error("診断 API エラー:", error);
      setErrorMessage(error.message || "サーバーエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    try {
      // 入力値取得
      const file = fileRef.current?.files;
      const destr = destRef.current?.value?.trim();
      const destfiler = destfileRef.current?.files;
      const interval_hm = interval_hmRef.current?.value;
      const transit_distancer = transit_distanceRef.current?.value;
      const transit_timer = transit_timeRef.current?.value;
      const transit = transitRef.current?.value;
      const orig1 = originRef.current?.value;
      const nearestmeter = nearestmeterRef.current?.value;
      const inner = innerRef.current?.value;

      // ★ 入力値検証
      if (!file || file.length === 0) {
        throw new Error("GTFS ZIPファイルを選択してください");
      }

      if (!destr && (!destfiler || destfiler.length === 0)) {
        throw new Error("施設名またはファイルのいずれかを選択してください");
      }

      if (orig1 === "destination") {
        if(transit=="direct"){
          setDirectdest(destr || "指定なし");

        } else{
          
          setTransitdest(destr || "指定なし");
        }
      } else {
        if(transit=="direct"){
          setDirectOrig(destr || "指定なし");

        } else{
          
          setTransitOrig(destr || "指定なし");
        }
      }

      console.log("入力値検証完了");

      // FormData 構築
      for (const f of file) {
        console.log("GTFS ファイル追加:", f.name);
        formData.append('file', f);
      }


      if (destfiler && destfiler.length > 0) {
        for (const f of destfiler) {
          console.log("施設ファイル追加:", f.name);
          formData.append('destfiles', f);
        }
      } else {
        formData.append('dest', destr);
      }

      formData.append('nearestmeter', nearestmeter);
      formData.append('interval_hm', interval_hm);
      formData.append('origin', orig1);
      formData.append('kind', submit);
      formData.append('inner', inner);

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
      formData.append('meshdf', metadataBlob1);


      // 乗り継ぎ関連パラメータ
      if (transit === "transit") {
        formData.append('transit', "transit");
        formData.append('transit_distance', transit_distancer);
        formData.append('transit_time', transit_timer);
      } else {
        formData.append('transit', "direct");
      }

      console.log("FormData 内容:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? value.name : value}`);
      }

      fetchChronogicalImpactAsync(formData, submit);

    } catch (error) {
      console.error("フォーム検証エラー:", error.message);
      setErrorMessage(error.message);
    }
  };

  return (
        <div className='chronogical_impact_to_destination'>
              {/* ★ エラーメッセージ表示 */}
              {errorMessage && (
                <div style={{
                  background: '#ffebee',
                  color: '#c62828',
                  padding: '12px 16px',
                  borderRadius: 4,
                  marginBottom: 16,
                  border: '1px solid #ef5350'
                }}>
                  <strong>エラー:</strong> {errorMessage}
                </div>
              )}

              <form action="" method="POST" encType="multipart/form-data" onSubmit={handleSubmit}>
                <div>
                    <div style={stepBoxStyle}>
                      <div style={{"display":"flex"}}>
                        <FieldLabel>Step0. 目的地までですか、出発地からですか？</FieldLabel>
                        <SelectField selectRef={originRef} onChange={(e) =>originSetcurrent(e.target.value)}>
                        <option value="dest" selected>目的地まで</option>
                        <option value="origin">出発地から</option>
                        </SelectField>
                      </div>
                    </div>
                    <div style={stepBoxStyle}>
                    <FieldLabel>Step1. 施設の設定</FieldLabel>
                    <p style={hintTextStyle}>施設名のみがA列に入ったxlsxからそれぞれ(からの/への)到達圏域を時間帯別に算出したいとき</p>
                    <FileField inputRef={destfileRef} hint="施設一覧(xlsx)を選択してください。" inline/>
                    <p style={hintTextStyle}>1つの施設(からの/への)到達圏域を時間帯別に算出したいとき</p>
                    <TextField inputRef={destRef} placeholder="施設等を入力" inline/>
                    </div>

                    <div style={stepBoxStyle}>
                      <FieldLabel>Step2. 時刻表設定</FieldLabel>
                      <TextField label="施設から最寄り駅・バス停までの距離(m)" inputRef={nearestmeterRef} defaultValue="300" size="10" inline />
                      <FileField
                        label="GTFS(zip)"
                        hint="バス停・時刻表データ(GTFS zip)をドロップまたは選択してください。"
                        onChange={handleGtfsZipChange}
                        inputRef={fileRef}
                        multiple
                        accept=".zip"
                      />
                    
                    {/*{agencyOptions.length > 0 ? (
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
                      )}*/}
                    </div>
                    
                    <div style={stepBoxStyle}>
                      <FieldLabel>Step3. 便の存在間隔</FieldLabel>
                      <TextField label="〇分刻み" inputRef={interval_hmRef} defaultValue="30" inline/>

                    </div>
                    <div style={stepBoxStyle}>
                      <FieldLabel>Step4. 最寄り乗車バス停からの距離</FieldLabel>
                      <TextField label="(m)" inputRef={innerRef} defaultValue="300" size="20" inline />

                    </div>
                                    
                    <div style={stepBoxStyle}>
                    {origincurrent=="dest"&&
                    <SelectField label="Step4. 入力地点到着便←乗り継ぎ便も考慮しますか？" selectRef={transitRef} inline onChange={(e) =>setdirectcurrent(e.target.value)}>
                      <option value="direct">到着便にアクセス可能なエリア</option>
                    <option value="transit">到着便への乗り継ぎ便にアクセス可能なエリア</option>
                    
                    </SelectField>}
                    {origincurrent=="origin"&&<SelectField label="Step4. 入力地点出発便→乗り継ぎ便も考慮しますか？" selectRef={transitRef} inline onChange={(e) =>setdirectcurrent(e.target.value)}>
                      <option value="direct">出発便にアクセス可能なエリア</option>
                    <option value="transit">出発便からの乗り継ぎ便にアクセス可能なエリア</option>
                    
                    </SelectField>}
                    </div>
                  {directcurrent=="transit"&&
                    <div style={stepBoxStyle}>
                    <FieldLabel>Step4-1. 乗り継ぎ便の条件を入力</FieldLabel>
                      <TextField label="降車バス停から乗継バス停まで距離(m)" inputRef={transit_distanceRef} defaultValue="300" size="6" inline />
                    
                      <TextField label="乗継時間(分)" inputRef={transit_timeRef} defaultValue="30" inline />
                    
                    </div>}

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap',justifyContent: 'center'}}>
                    <PrimaryButton value="ridingtime" onClick={(e)=>submitbutton(e.target.value)}>所要時間算出</PrimaryButton>
                    <PrimaryButton value="fare" onClick={(e)=>submitbutton(e.target.value)}>運賃帯算出</PrimaryButton>
                    <PrimaryButton value="frequency" onClick={(e)=>submitbutton(e.target.value)}>運行本数算出</PrimaryButton>
                  </div>
                </div>

                </form>
                
          </div>
        )
      }

export default ChronogicalImpact;
