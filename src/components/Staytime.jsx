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

const Staytime = () => {
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
  const destfileRef = useRef();
  const origfileRef = useRef();
  const originRef=useRef();
  const transitRef=useRef();
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
  const setLoading = useLoadingStore((state) => state.setLoading);
  // ★ 修正：Vercel API ルート経由で診断モジュールを呼び出し（バッファ読み込み版）
  const fetchStaytimeAsync = async (formData, routingvalue) => {
    let data_existed = [];
    const url = `http://52.62.35.205:5000/staytime`;

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
      let dp0 = `staytime_${transit}_${originRef.current.value}`;

      console.log("API レスポンス:", data);

      data_existed = {"detail":`${dest_name}着_staytime`, "checked":true, "data":data};
      if (transit==="direct"){
        originRef.current.value=="dest"?setDirectDest(dest_name):setDirectOrig(dest_name);
      } else {
        originRef.current.value=="dest"?setTransitDest(dest_name):setTransitOrig(dest_name);
      }
      setData(data_existed, dp0);
      // ファイルダウンロード（JSON + GeoJSON）
      const metadataLink1 = document.createElement("a");
      const metadataLink2 = document.createElement("a");
      const d01={
        "property": dp0,
        "detail": `${dest_name}着_staytime`,
        "data": data.data,
        "interval":data.interval,
        "dest":data.dest,
        "weekday":data.weekday,
        "destpoint":data.point,
        "inner":innerRef.current.value
      }
      // Blob1: JSON メタデータ
      const d001 = JSON.stringify(originRef.current.value=="dest"?d01:o01, null, 2);

      const metadataBlob1 = new Blob([d001], { type: 'application/json' });
      metadataLink1.href = URL.createObjectURL(metadataBlob1);
      metadataLink1.download =`staytime_${transit}_${dest_name}.json`;
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
      const file = origfileRef.current?.files;
      const destfiler = destfileRef.current?.files;
      const transit = transitRef.current?.value;
      const dest = destRef.current?.value;

      // ★ 入力値検証
      if (!file || file.length === 0) {
        throw new Error("GTFS ZIPファイルを選択してください");
      }

      if (!destr && (!destfiler || destfiler.length === 0)) {
        throw new Error("施設名またはファイルのいずれかを選択してください");
      }


      console.log("入力値検証完了");

      // FormData 構築
      for (const f of file) {
        console.log("GTFS ファイル追加:", f.name);
        formData.append('origfile', f);
      }


      if (destfiler && destfiler.length > 0) {
        for (const f of destfiler) {
          console.log("施設ファイル追加:", f.name);
          formData.append('destfile', f);
        }
      } else {
        formData.append('dest', dest);
      }




      // メッシュID を元のキー名で送信
      formData.append('meshdf', JSON.stringify(meshIds));



      console.log("FormData 内容:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? value.name : value}`);
      }

      fetchStaytimeAsync(formData, submit);

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
                    <FieldLabel>Step1. 目的地の設定</FieldLabel>
                    <TextField inputRef={destRef} placeholder="施設等を入力" inline/>
                    </div>

                    <div style={stepBoxStyle}>
                      <FieldLabel>Step2. 時刻表設定</FieldLabel>
                      <FileField
                        label="json"
                        hint="所要時間で算出した目的地までのファイルをアップしてください。"
                        inputRef={origfileRef}
                        multiple
                        accept=".zip"
                      />
                      <FileField
                        label="json"
                        hint="所要時間で算出した目的地からのファイルをアップしてください。"
                        inputRef={destfileRef}
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

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap',justifyContent: 'center'}}>
                    <PrimaryButton value="staytime" onClick={(e)=>submitbutton(e.target.value)}>滞在時間算出</PrimaryButton>
                    
                  </div>
                </div>

                </form>
                
          </div>
        )
      }

export default Staytime;
