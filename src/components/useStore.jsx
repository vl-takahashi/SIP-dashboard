import { create } from "zustand";
import {useState,useEffect} from 'react';
import { ChevronsUp } from "lucide-react";
// import { resourceDir,join } from '@tauri-apps/api/path'; // Tauri removed
// import { readDir } from '@tauri-apps/plugin-fs'; // Tauri removed
import { yakuba } from "./Globalvariable";

// レイヤー種別のキー一覧（読み込み対象の器）
const REGISTRY_KEYS=["ridingtime_direct_staytime","od_visual","odtime_dest_mesh","odtime_orig_mesh","area","area_addressed","popmesh","spatialbuffer","lipt","ridingtime_transit_orig","ridingtime_direct_orig","ridingtime_transit_dest","ridingtime_direct_dest","fare","frequency_on_routes","addressed","rosenbus","editline","facility","elevation","road","railline","tram","highwaybus","railstop","busstop"];
export const useLayerflagStore=create((set)=>({
  layerflag:["","",""],
  setLayerflag: (time,dest,weekday) =>
    set((state) => {

      return {
        layerflag: [time,dest,weekday],
        }
    }),
}))
/**
 * セッション管理ストア（Zustand）
 * 各住民の回答・診断結果・進捗を管理
 */
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useStore = create((set) => ({
    receivedSessions: [],

  addReceivedDiagnosis: (sessionData) => {
    set((state) => {
      const userId = sessionData.userId || `user_${Date.now()}`;

      // 既存の診断結果から同じ userId のデータを除外
      const filtered = state.receivedSessions.filter(
        (item) => (item.userId || `user_${Date.now()}`) !== userId
      );

      // 新しい診断結果を先頭に追加（最新のみを表示）
      return {
        receivedSessions: [
          {
            ...sessionData,
            receivedAt: new Date().toISOString(),
          },
          ...filtered,
        ],
      };
    });
  },

  clearReceivedSessions: () => {
    set({ receivedSessions: [] });
  },
  currentSession: {
    id: generateSessionId(),
    userName: '',
    answers: {},
    diagnosis: null,
    progress: 0,
    createdAt: new Date().toISOString(),
    metadata: {},
  },

  sessions: [],
  searchDB: null,

  startSession: (userName) => {
    set((state) => ({
      currentSession: {
        id: generateSessionId(),
        userName,
        answers: {},
        diagnosis: null,
        progress: 0,
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    }));
  },

  addAnswer: (questionId, answer) => {
    set((state) => {
      const totalQuestions = 6; // Q1-Q6
      const answeredCount = Object.keys(state.currentSession.answers).length + 1;
      const progress = Math.round((answeredCount / totalQuestions) * 100);

      return {
        currentSession: {
          ...state.currentSession,
          answers: {
            ...state.currentSession.answers,
            [questionId]: answer,
          },
          progress: Math.min(progress, 100),
        },
      };
    });
  },

  setDiagnosis: (diagnosis) => {
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        diagnosis,
        progress: 100,
      },
    }));
  },

  saveSession: () => {
    set((state) => ({
      sessions: [...state.sessions, state.currentSession],
      currentSession: {
        id: generateSessionId(),
        userName: '',
        answers: {},
        diagnosis: null,
        progress: 0,
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    }));
  },

  uploadSearchDB: (rawData) => {
    set({ searchDB: rawData });
  },

  exportJSON: () => {
    // getCurrentState() で現在のストア状態を取得
    const state = useStore.getState();
    return JSON.stringify(state.currentSession, null, 2);
  },

  getAllSessions: () => {
    return useStore.getState().sessions;
  },
}));

const REGISTRY_ITEMIDS={"ridingtime_direct_staytime":[],"od_visual":[],"odtime_dest_mesh":[],"odtime_orig_mesh":[],"area":[],"area_addressed":[],
  "popmesh":[],"spatialbuffer":[],"lipt":[],"ridingtime_transit_orig":[],"ridingtime_direct_orig":[],"ridingtime_transit_dest":[],"ridingtime_direct_dest":[],"fare":[],
  "frequency_on_routes":[],"rosenbus":[],"editline":[],"facility":[],"elevation":[],
  "road":[],"railline":[],"tram":[],"highwaybus":[],"railstop":[],"busstop":[]};

// 呼ぶたびに必ず新しいオブジェクトを作る。
// モジュール変数を直接pushし続けると再読み込みごとにデータが積み上がってしまうため、
// 初期化とrefreshJsonData実行の両方でこの関数経由でのみ registry を用意する。
function createEmptyRegistry(){
  const registry={};
  REGISTRY_KEYS.forEach((key)=>{ registry[key]=[]; });
  return registry;
}

export const useEditStore=create((set)=>({
  edit:false,
  setEdit: () => set((state)=>({ edit: !state.edit }))
}))
  const INITIAL_VIEW_STATE = {
      longitude: yakuba["東京都新宿区"]["lng"],
      latitude: yakuba["東京都新宿区"]["lat"],
      bearing: 0,
      pitch: 0,
      zoom: 12,
  };
export const useOrigDestStore=create((set)=>({
  origdest:"dest",
  setorigdest: (newItem) =>
    set((state) => {

      return {
        origdest: newItem,
        }
    }),
}))
export const useViewCustomerStore=create((set)=>({
  select:INITIAL_VIEW_STATE,
  selectView: (newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    }),
}))
export const useMeshidStore=create((set)=>({
  meshid:[],
  setMeshid: (newItem) =>
    set((state) => {

      return {
        meshid: [...state.meshid,newItem],
        }
    }),
}))
export const useViewCombinationStore=create((set)=>({
  select:{ ...INITIAL_VIEW_STATE, pitch: 45 },
  selectView: (newItem) =>
    set(() => ({
      select: newItem,
    })),
}))
export const useViewAccesibilityStore=create((set)=>({
  select:{ ...INITIAL_VIEW_STATE, pitch: 0 },
  selectView: (newItem) =>
    set(() => ({
      select: newItem,
    })),
}))
export const useViewFutureStore=create((set)=>({
  select:INITIAL_VIEW_STATE,
  selectView: (newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    }),
}))
export const useViewDemandStore=create((set)=>({
  select:INITIAL_VIEW_STATE,
  selectView: (newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    }),
}))
export const useFlagStore=create((set)=>({
  flag:false,
  setflag: () =>
    set((state) => {

      return {
        flag: !state.flag,
        }
    }),
  flagspatial:false,
  setflagspatial: (newItem) =>
    set((state) => {

      return {
        flagspatial: !state.flagspatial,
        }
    }),
  flagcheck:false,
  setflagcheck: (newItem) =>
    set((state) => {

      return {
        flagcheck: !state.flagcheck,
        }
    }),
}))
export const useHoverStore=create((set)=>({
  select:["住所","居住地","バス停","最寄バス停","所要時間","運賃","運行本数","バス路線"],
  selectHover: (newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    }),
}))
export const useDemandStore=create((set)=>({
  demandData:[],
  setDemandData: (newItem) =>
    set((state) => {

      return {
        demandData: newItem,
        }
    }),
}))
export const usePooledweekdayStore=create((set)=>({
  pooledweekday:[],
  setPooledweekday: (newItem) =>
    set((state) => {

      return {
        pooledweekday: [...state.pooledweekday,newItem],
        }
    }),
}))
export const useLosStore=create((set)=>({
  losData:[],
  setLosData: (newItem) =>
    set((state) => {

      return {
        losData: newItem,
        }
    }),
}))
export const useLayercheckStore=create((set)=>({
  layercheck:["複数レイヤー表示","タイムスライダー"],
  setLayercheck: (newItem) => set({ select: newItem }),
  select:"複数レイヤー表示",
  selectLayercheck: (newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    }),
}))
export const useQuestionStore= create((set)=>({
  question:false,
  setquestion: (newItem) =>
    set((state) => {

      return {
        question: !state.question,
        }
    }),
}))
export const useNumStore=create((set)=>({
 num:0,
  setNum: (newItem) =>
    set((state) => {

      return {
        num: newItem,
        }
    }),
}))
export const useDatacheckedStore=create((set)=>({
  checked:false,
  setChecked: (newItem) =>
    set((state) => {

      return {
        checked: !state.checked,
        }
    }),
}))
export const useDataStore = create((set)=>({
  checkId:REGISTRY_ITEMIDS,
  // 生データの本体。読み込んだ各レイヤーのGeoJSON等をここに集約する。
  // 直接ここへpushで追記するのではなく、必ずsetXxx関数（イミュータブルな更新）経由で書き換えること。
  data: createEmptyRegistry(),
  flag:0,
  agencyValue: [],
  // ★複数の事業者を同時表示するため、agencyValue を配列で管理
  setAgency: (newAgency) => set((state) => {
    // 既に存在する場合は追加しない（重複排除）
    if (!state.agencyValue.includes(newAgency)) {
      return { agencyValue: [...state.agencyValue, newAgency] };
    }
    return state;
  }),
  dimention:"250",
  // ★複数の事業者を同時表示するため、agencyValue を配列で管理
  setDimention: (newdimention) =>
    set(() => ({
      dimention: newdimention,
    })),

  // refreshJsonData()の読み込み結果をまとめて上書きするための関数。
  // 「読み込みが終わった新しいregistryオブジェクト」を渡すことを前提にしている。
  setDatafirst: (newRegistry) =>
    set(() => ({
      data: newRegistry,
    })),

  // 人口メッシュ(popmesh)・所要時間(ridingtime_direct)に住所情報(SNAME)をマージする関数。
  // keycode: メッシュ側とマージ元(addressed)を結びつけるキー
  // SNAME  : 書き込みたい地域名のプロパティ名
  setAddress: (newItem,keycode,SNAME) =>
    set((state) => {
      const prevridingtimeArray = state.data["ridingtime_direct_dest"] || [];
      const prevpopmeshArray = state.data["popmesh"] || [];

      // newItem[0]（対象を識別する名前配列）に合致する既存レイヤーを探す。
      // find()は見つからなければundefinedを返すため、この後で必ずnullチェックする。
      const matchridingtimeArray=prevridingtimeArray.find((d)=>newItem[0].includes(d[0]));
      const matchpopmeshArray=prevpopmeshArray.find((d)=>newItem[0].includes(d[0]));

      // マッチしなかった「他のレイヤー」は全部残す。
      // 元コードはfind()で1件しか残さない不具合があったため、filter()に修正（他のレイヤーが消えないように）。
      const nomatchpopmeshArray=prevpopmeshArray.filter((d)=>!newItem[0].includes(d[0]));
      const nomatchridingtimeArray=prevridingtimeArray.filter((d)=>!newItem[0].includes(d[0]));
      const onlyaddressedArray=newItem[2];

      // ★クラッシュ対策その1：マッチする対象が無い場合はここで処理を止め、元のstateをそのまま返す。
      // （以前はここでundefined[2]にアクセスして例外が発生していた）
      if (!matchridingtimeArray || !matchpopmeshArray || !onlyaddressedArray) {
        console.warn("setAddress: マッチするレイヤーが見つからないためマージをスキップしました", { keycode, SNAME });
        return { data: state.data };
      }

      // マージに失敗した場合のフォールバック値として、マッチ前のデータで初期化しておく。
      // （こうしておけば、tryが失敗してもundefinedをstateに入れることがない）
      let matchridingtimeArrayR = matchridingtimeArray;
      let matchpopmeshArrayR = matchpopmeshArray;

      try{
        // ★クラッシュ対策その2：features自体が無いケースも空配列にフォールバックする。
        const popmeshFeatures = matchpopmeshArray[2]?.features || [];
        const ridingtimeFeatures = matchridingtimeArray[2]?.features || [];
        const addressedFeatures = onlyaddressedArray.features || [];

        // 人口メッシュ側：keycodeが一致するaddressed地物からSNAME（地域名）を1件だけ書き込む
        for (const feature of popmeshFeatures){
          feature.properties[SNAME]="";
          const hit = addressedFeatures.find((a)=>a.properties[keycode]===feature.properties[keycode]);
          if (hit) feature.properties[SNAME]=hit.properties[SNAME];
        }
        // JSON.parse(JSON.stringify(...))でディープコピーしてから確定値として採用する
        matchpopmeshArrayR=JSON.parse(JSON.stringify(matchpopmeshArray));

        // 所要時間側も同様の処理
        for (const feature of ridingtimeFeatures){
          feature.properties[SNAME]="";
          const hit = addressedFeatures.find((a)=>a.properties[keycode]===feature.properties[keycode]);
          if (hit) feature.properties[SNAME]=hit.properties[SNAME];
        }
        matchridingtimeArrayR=JSON.parse(JSON.stringify(matchridingtimeArray));
      } catch (e){
        // ★クラッシュ対策その3：ここで例外が起きても、上で用意したフォールバック値のまま返すのでアプリは落ちない。
        console.warn("setAddress: マージ処理に失敗したため、元データのまま保持します。", e.message);
      }

      return {
        data: {
          ...state.data,
          ["popmesh"]: [...nomatchpopmeshArray, matchpopmeshArrayR],
          ["ridingtime_direct_dest"]: [...nomatchridingtimeArray, matchridingtimeArrayR],
        },
      };
    }),

  // 1レイヤー分のデータを追記する（読み込み後の差分commitなどで使う想定）
  setData: (newItem,kind) =>
    set((state) => {
      const prevArray = state.data[kind] || [];
      const newArray = prevArray.concat([newItem]);
      const newData = Object.assign({}, state.data, { [kind]: newArray });
      return {
        data: newData,
      };
    }),

  // レイヤーのチェックボックス（表示/非表示）を切り替える。
  // kind       : "popmesh"などレイヤー種別のキー
  // detail     : レイヤー内の対象を識別する名前（row[0]と一致するもの）
  // desiredState: 目的の状態。undefined なら反転（toggle）、true/false なら直接設定
  // 例1: setCheck("popmesh", "detail_name") → 反転
  // 例2: setCheck("popmesh", "detail_name", true) → true に設定

  ridingtime_all:[],
  // 1レイヤー分のデータを追記する（読み込み後の差分commitなどで使う想定）
  setRidingtimeall: (newItem) =>
    set((state) => {
      console.log(newItem)
      state.ridingtime_all.push(newItem);
      return {
        ridingtime_all: state.ridingtime_all,
        // flagは「何か更新があった」ことを他コンポーネントに知らせるためのカウンタ的な値
        flag: state.flag === 0 ? 1 : 0,
      };
    }),
  ridingtime:[],
  // 1レイヤー分のデータを追記する（読み込み後の差分commitなどで使う想定）
  setRidingtime: (newItem) =>
    set((state) => {
      console.log(newItem)
      return {
        ridingtime: newItem,
      };
    }),
  setCheck: (kind, detail, desiredState) =>
    set((state) => {
      const layerList = state.data[kind];
      console.log(kind, detail, desiredState);
      console.log(state.data[kind]);

      // ★クラッシュ対策：kindが存在しない場合はここで止める
      if (!layerList) {
        console.warn(`setCheck: kind="${kind}" は存在しません`);
        return {};
      }

      // ★detail に基づいてアイテムを探す（findIndex）
      const index = layerList.findIndex((item) => {
        // item[0] が detail と一致するものを探す
        return item.detail === detail || (Array.isArray(item.detail) && item.detail === detail);
      });

      if (index === -1) {
        console.warn(`setCheck: detail="${detail}" は kind="${kind}" 内に見つかりません`);
        return {};
      }
      // ★イミュータブルな更新：新しい配列を作成して、該当アイテムの可視性を更新
      const updatedList = layerList.map((item, i) => {
        if (i === index) {
          // desiredState が undefined なら反転、それ以外なら直接設定
          const newVisibility = desiredState !== undefined ? desiredState : !item.checked;
          return {"detail":item.detail, "checked":newVisibility, "data":item.data, "agency":item.agency};
        }
        return item;
      });
      console.log(updatedList)

      return {
        data: {
          ...state.data,
          [kind]: updatedList,
        },
        // flagは「何か更新があった」ことを他コンポーネントに知らせるためのカウンタ的な値
        flag: state.flag === 0 ? 1 : 0,
      };
    }),
}));

// フォルダ内のJSON群を読み込んでuseDataStoreに反映する。
// path: ディレクトリハンドル（Tauriのファイル選択などから渡される）
export async function nextJsonData(path, sessionId, propertyFilter) {
  // sl: 「時刻・曜日情報を別途useDestStore/useWeekdayStoreにも登録する」対象のレイヤー種別
  const sl=["ridingtime_direct_staytime","ridingtime_direct_orig","ridingtime_transit_orig","ridingtime_direct_dest","ridingtime_transit_dest","fare","frequency"];
  // sa: 「区域名(area)を別途useAreaStoreにも登録する」対象のレイヤー種別
  const sa=["area_addressed"];
  // folderlist: ファイル内のproperty値として受け付けるレイヤー種別の一覧
  const folderlist=["od_visual","odtime_dest_mesh","odtime_orig_mesh","area","area_addressed","addressed","popmesh","rosenbus","busstop","facility","fare_direct","fare_transit","railline","railstop","spatialbuffer","ridingtime_transit_orig","ridingtime_direct_orig","ridingtime_transit_dest","ridingtime_direct_dest","addressed","lipt","frequency_on_routes"];
  const sp=["popmesh"]
  // ★重要：ここで毎回「新しいregistry」を作る。
  // 以前はモジュール変数を直接pushし続けていたため、再読み込みするたびに
  // 前回分のデータが残ったまま積み上がり、最終的にメモリ膨張でクラッシュする原因になっていた。
  const freshRegistry = useDataStore.getState().data;
  let failedFileCount = 0; // 読み込みに失敗したファイル数（デバッグ・ユーザー通知用）
let filteredTransitData = null; // sessionId指定時のフィルタリング結果

          console.log("222 - sessionId:", sessionId, "propertyFilter:", propertyFilter)
    for await (const entry of path.values()) {
      if (entry.kind !== 'file') continue;

      // ★重要：1ファイルの処理をここで個別にtry/catchする。
      // 以前は全体を1つのtry/catchで囲っていたため、1件でもフォーマット異常のファイルがあると
      // それ以降の正常なファイルまで一切読み込まれなくなっていた。
        const file = await entry.getFile();
        const text = await file.text();
        const props = JSON.parse(text).property;
        console.log(props);
        // propertyがfolderlistのどれにも該当しない場合は、警告だけ出してスキップする
        // （以前は何もログを出さずに黙って無視していたため、原因調査がしづらかった）
        const ls = folderlist.find((key) => key === props);
        const json = JSON.parse(text);
        // 📌 sessionId指定時：transit-data を一度だけ Vercel KV に送信
        if (sessionId && props === propertyFilter) {
          filteredTransitData = json;
          console.log(`✅ Vercel KV 送信対象: property="${props}", sessionId="${sessionId}"`);
        }

        if (sl.includes(props)) {
          console.log(json);
          useDataStore.getState().setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""},props);

          // 曜日・目的地情報を別storeにも反映。ここが失敗してもファイル自体の読み込みは続ける。
          if (props.includes("direct_dest")||props.includes("direct_dest")){
            useDestStore.getState().setDirectdest(json.dest);
          } else if (props.includes("direct_orig")){
            useOrigStore.getState().setDirectorig(json.orig);
          } else if (props.includes("transit_dest")){
            useDestStore.getState().setTransitdest(json.dest);
          } else if (props.includes("transit_orig")){
            useOrigStore.getState().setTransitorig(json.orig);
          }
          useWeekdayStore.getState().setWeekday(json.weekday);
          useDataStore.getState().setRidingtimeall(json.data);
        } else if (sa.includes(props)) {
          // geometryを消してデータ量を減らす（元のロジックを維持）。
          // json.data.featuresが無いケースでも落ちないようoptional chainingで保護。
          if (json.data?.features) json.data.features.geometry = null;
          useAreaStore.setArea(json.area);
          // ★4要素目に agency を追加してグルーピング機能を有効化
          useDataStore.setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""},props);
        } else if (sp.includes(props)) {
          // ✅ freshRegistry に直接保存（usePopmeshStore は使わない）
          useDataStore.setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""},props);
        } else {
          // ★4要素目に agency を追加してグルーピング機能を有効化
          useDataStore.setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""},props);
        }
    }
    console.log(`読み込み成功！（失敗ファイル数: ${failedFileCount}）`);

    // 📌 sessionId指定時：フィルタリング済みデータを Vercel KV に送信
    if (sessionId && filteredTransitData) {
      try {
        const response = await fetch('/api/transit-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId,
          },
          body: JSON.stringify({
            sessionId,
            transitData: filteredTransitData,
          }),
        });
        const result = await response.json();
        if (result.success) {
          console.log(`✅ transit-data を Vercel KV に保存: sessionId="${sessionId}"`);
        } else {
          console.warn(`⚠️ transit-data 保存失敗: ${result.message}`);
        }
      } catch (error) {
        console.error(`❌ transit-data 保存エラー:`, error.message);
      }
    }
    useFlagStore.getState().setflagspatial(1);
}
// フォルダ内のJSON群を読み込んでuseDataStoreに反映する。
// path: ディレクトリハンドル（Tauriのファイル選択などから渡される）
export async function refreshJsonData(path, sessionId, propertyFilter) {
  // sl: 「時刻・曜日情報を別途useDestStore/useWeekdayStoreにも登録する」対象のレイヤー種別
  const sl=["ridingtime_direct_staytime","ridingtime_direct_orig","ridingtime_direct_dest","ridingtime_transit_dest","fare","frequency"];
  // sa: 「区域名(area)を別途useAreaStoreにも登録する」対象のレイヤー種別
  const sa=["addressed"];
  // folderlist: ファイル内のproperty値として受け付けるレイヤー種別の一覧
  const folderlist=["od_visual","odtime_dest_mesh","odtime_orig_mesh","area","area_addressed","addressed","popmesh","rosenbus","busstop","facility","fare_direct","fare_transit","railline","railstop","spatialbuffer","ridingtime_direct_dest","ridingtime_transit_dest","addressed","lipt","frequency_on_routes"];
  const sp=["popmesh"]
  // ★重要：ここで毎回「新しいregistry」を作る。
  // 以前はモジュール変数を直接pushし続けていたため、再読み込みするたびに
  // 前回分のデータが残ったまま積み上がり、最終的にメモリ膨張でクラッシュする原因になっていた。
  const freshRegistry = createEmptyRegistry();
  let failedFileCount = 0; // 読み込みに失敗したファイル数（デバッグ・ユーザー通知用）
  let filteredTransitData = null; // sessionId指定時のフィルタリング結果

          console.log("222 - sessionId:", sessionId, "propertyFilter:", propertyFilter)
    for await (const entry of path.values()) {
      if (entry.kind !== 'file') continue;

      // ★重要：1ファイルの処理をここで個別にtry/catchする。
      // 以前は全体を1つのtry/catchで囲っていたため、1件でもフォーマット異常のファイルがあると
      // それ以降の正常なファイルまで一切読み込まれなくなっていた。
        const file = await entry.getFile();
        const text = await file.text();
        const props = JSON.parse(text).property;
        console.log(props)
        // propertyがfolderlistのどれにも該当しない場合は、警告だけ出してスキップする
        // （以前は何もログを出さずに黙って無視していたため、原因調査がしづらかった）
        const ls = folderlist.find((key) => key === props);
        

        const json = JSON.parse(text);

        // 📌 sessionId指定時：transit-data を一度だけ Vercel KV に送信
        if (sessionId && props === propertyFilter) {
          filteredTransitData = json;
          console.log(`✅ Vercel KV 送信対象: property="${props}", sessionId="${sessionId}"`);
        }

        if (sl.includes(props)) {
          useDataStore.getState().setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || "","point":json.destpoint},props);

          console.log("11")
          // 曜日・目的地情報を別storeにも反映。ここが失敗してもファイル自体の読み込みは続ける。
          if (props.includes("direct_dest")){
            useDestStore.getState().setDirectdest(json.dest);
          } else if (props.includes("direct_orig")){
            useDestStore.getState().setDirectorig(json.orig);
          } else if (props.includes("transit_dest")){
            useDestStore.getState().setTransitdest(json.dest);
          } else if (props.includes("transit_orig")){
            useDestStore.getState().setTransitorig(json.orig);
          }
          useWeekdayStore.getState().setWeekday(json.weekday);
          console.log("1")
        } else if (sa.includes(props)) {
          // geometryを消してデータ量を減らす（元のロジックを維持）。
          // json.data.featuresが無いケースでも落ちないようoptional chainingで保護。
          if (json.data?.features) json.data.features.geometry = null;
          useAreaStore.getState().setArea(json.area);
          // ★4要素目に agency を追加してグルーピング機能を有効化
          useDataStore.getState().setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""},props);
        } else if (sp.includes(props)) {
          // ✅ freshRegistry に直接保存（usePopmeshStore は使わない）
          useDataStore.getState().setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""},props);
          usePopmeshStore.getState().setPopmesh({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""})
        } else {
          // ★4要素目に agency を追加してグルーピング機能を有効化
          useDataStore.getState().setData({"detail":json.detail, "checked":true, "data":json.data, "agency":json.agency || "","address":json.address || ""},props);
        }
    }

    console.log(`読み込み成功！（失敗ファイル数: ${failedFileCount}）`);

    // 📌 sessionId指定時：フィルタリング済みデータを Vercel KV に送信
    if (sessionId && filteredTransitData) {
      try {
        const response = await fetch('/api/transit-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId,
          },
          body: JSON.stringify({
            sessionId,
            transitData: filteredTransitData,
          }),
        });
        const result = await response.json();
        if (result.success) {
          console.log(`✅ transit-data を Vercel KV に保存: sessionId="${sessionId}"`);
        } else {
          console.warn(`⚠️ transit-data 保存失敗: ${result.message}`);
        }
      } catch (error) {
        console.error(`❌ transit-data 保存エラー:`, error.message);
      }
    }

    // ★デバッグ：freshRegistry の全アイテムを確認
    console.log("🔍 freshRegistry:", freshRegistry);

    useFlagStore.getState().setflagspatial(1);
    // ★JSON から agency を抽出して親チェックボックスを作成
    const agencies = new Set();
    Object.entries(freshRegistry).forEach(([key, items]) => {
      console.log(`📋 [${key}] のアイテム数: ${items.length}`);
      items.forEach((item, index) => {
        console.log(`  [${index}] item[3]="${item.agency}", 全要素:`, item);
        if (item.agency && item.agency !== "") {
          agencies.add(item.agency);
        }
      });
    });

    // ★抽出した agencies を setAgency に設定
    const uniqueAgencies = Array.from(agencies);
    uniqueAgencies.forEach((agency) => {
      useDataStore.getState().setAgency(agency);
    });
    console.log(`✅ 抽出した agency: ${JSON.stringify(uniqueAgencies)}`);

    useBarchartStore.getState().setBar(true);
  }

export const useBarchartStore = create((set)=>({
  bar:false,
  setBar: (newText) => set({ bar: true }),
}))

export const usePopmeshStore = create((set)=>({
  
  popmesh:[],
  setPopmesh: (newText) => set((state) => {
    console.log(newText);
    const prev=useDataStore.getState().data["popmesh"];
    return { popmesh: [...prev, newText] }}
  ),
}))
export const usePopStore = create((set)=>({
  pop:"",
  selectPop: (newText) => set(// ★その後、データ処理を実行
  setTimeout(() => {
    // フィルタリングと色設定を実行
  }, 1),{ pop: newText },
  ),
}))
export const useDirectStore = create((set)=>({
  orig:"",
  selectOrig: (newText) => set({ orig: newText }),
  direct:"",
  selectDirect: (newText) => set({ direct: newText }),
}))
export const useTimesliderStore = create((set)=>({
  time:-7/100000000,
  clicktime: (newText) => set({ time: newText }),
}))
export const useStaycheckStore = create((set)=>({
  staycheck:"nostay",
  
  setStaycheck: ((newItem) => set((state) => {
    console.log(newItem)
    return {
      
        staycheck: newItem
        }
    })
  )}
))


export const useWeekdayStore = create((set)=>({
  weekday:[],
  setWeekday: ((newItem) => set((state) => {
    const prevArray = state.weekday || [];
    console.log(newItem);
    const arrayA=[...prevArray, ...newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        weekday: arrayB
        }
    })
  ),
  selectflag:"",
  selectWeekdayflag: (newItem) =>
    set((state) => {

      return {
        selectflag: newItem,
        }
    }),
  select:"",
  selectWeekday: (newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    }),
}))
export const useKindStore = create((set)=>({
  kind:["所要時間","運賃","運行本数"],
  select:"所要時間",
  selectKind: (newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    }),
}))
export const useLegendStore = create((set)=>({
  legends:[],
  setLegends: ((newItem) => 
    set((state) => {
    const arrayB = newItem;
    return {
      
        legends: arrayB,
        }
    })
  ),
  values:[],
  setLegendvalues: ((newItem) => 
    set((state) => {
    const arrayB1 = newItem;
    return {
      
        values: arrayB1,
        }
    })
  ),

}))
export const useAreaStore = create((set) => ({
  area: [],
  setArea: (newItem) =>
    set((state) => {
        const prevArray = state.area || [];
        console.log(newItem);
        const arrayA=[...prevArray, newItem];
        const arrayB = Array.from(new Set(arrayA));
        return {
          
            area: arrayB,
            }
    }),
  areaid:[],
  setAreaid: ((newItem) => 
    set((state) => {
    const prevArray = state.area || [];
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        areaid: arrayB,
        }
    })
  ),
  select:"",
  selectArea: ((newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    })
  )}
))
export const useAddressStore = create((set)=>({
  address:[],
  setAddress: ((newItem) => 
    set((state) => {
    const prevArray = state.area || [];
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        address: arrayB,
        }
    })
  ),
  select:"",
  selectAddress: ((newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    })
  )}
))



export const useDestStore = create((set)=>({
  directdest:[],
  setDirectdest: ((newItem) => 
    set((state) => {
    const prevArray = state.directdest;
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        directdest: arrayB,
        }
    })
  ),
  transitdest:[],
  setTransitdest: ((newItem) => 
    set((state) => {
    const prevArray = state.transitdest;
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        transitdest: arrayB,
        }
    })
  ),
  directorig:[],
  setDirectorig: ((newItem) => 
    set((state) => {
    const prevArray = state.directorig;
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        directorig: arrayB,
        }
    })
  ),
  transitorig:[],
  setTransitorig: ((newItem) => 
    set((state) => {
    const prevArray = state.transitorig;
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        transitorig: arrayB,
        }
    })
  ),
  select:"",
  selectDest: ((newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    })
  )}
))


export const useOrigStore = create((set)=>({
  directorig:[],
  setDirectorig: ((newItem) => 
    set((state) => {
    const prevArray = state.directorig;
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        directorig: arrayB,
        }
    })
  ),
  transitorig:[],
  transitSetOrig: ((newItem) => 
    set((state) => {
    const prevArray = state.orig || [];
    console.log(newItem);
    const arrayA=[...prevArray, newItem];
    const arrayB = Array.from(new Set(arrayA));
    return {
      
        transitorig: arrayB,
        }
    })
  ),
  select:"",
  selectOrig: ((newItem) =>
    set((state) => {

      return {
        select: newItem,
        }
    })
  )}
))


export const useCheckStore = create((set)=>({
  Checklist: [],
  setChecklist: (kind, detail) =>
    set((state) => {
      const prev = state.Checklist || [];
      // kind と detail を [kind, detail] の形式で保存
      const newChecklist = prev.concat([[kind, detail]]);
      return {
        Checklist: newChecklist,
      }
    }),
  }));
const areastoreRegistry={};
export const useArealistStore = create((set)=>({
  Arealist: [],
  setArealist: (newText) => set({ Arealist: newText }),

  }));

export const useClickmeshStore = create((set) => ({
  clickmeshpop: "未選択です",
  clickmeshaddress: "未選択です",
  setClickmeshaddress: (newText) => set({ clickmeshaddress: newText }),
  setClickmeshpop: (newText) => set({ clickmeshpop: newText }),
}));
export const useClickareaStore = create((set) => ({
  clickareapop: "未選択です",
  clickareahousehold: "未選択です",
  clickareapopdensity: "未選択です",
  clickareaaddress: "未選択です",
  setClickareaaddress: (newText) => set({ clickareaaddress: newText }),
  setClickareapop: (newText) => set({ clickareapop: newText }),
  setClickareahousehold: (newText) => set({ clickareahousehold: newText }),
  setClickareapopdensity: (newText) => set({ clickareapopdensity: newText }),
}));

export const useClicklanduseStore = create((set) => ({
  clicklanduse: "no selected landuse",
  setClicklanduse: (newText) => set({ clicklanduse: newText }),
}));
export const useClickplanningareaStore = create((set) => ({
  clickplanningarea: "no selected planningarea",
  setClickplanningarea: (newText) => set({ clickplanningarea: newText }),
}));
export const useClickpopmeshStore = create((set) => ({
  clickpopmesh: "no selected popmesh",
  setClickpopmesh: (newText) => set({ clickpopmesh: newText }),
}));
export const useClickneareststopStore = create((set) => ({
  clickneareststop: "no selected nearest stop",
  setClickneareststop: (newText) => set({ clickneareststop: newText }),
}));
export const useClickstopStore = create((set) => ({
  clickstop: "no selected stop",
  setClickstop: (newText) => set({ clickstop: newText }),
}));
export const useFacilityStore = create((set) => ({
  facility: "no selected facility",
  setFacility: (newText) => set({ facility: newText }),
}));
export const useFareStore = create((set) => ({
  fare: "no selected fare",
  setFare: (newText) => set({ fare: newText }),
}));
export const useClicknearestbuslineStore = create((set) => ({
  clicknearestrosenbus: "no selected busline",
  setClicknearestrosenbus: (newText) => set({ clicknearestbusline: newText }),
}));
export const useClicknearestraillineStore = create((set) => ({
  clicknearestrailline: "no selected railline",
  setClicknearestrailline: (newText) => set({ clicknearestrailline: newText }),
}));
export const useClicknearestridetimeStore = create((set) => ({
  clicknearestridetime: "no selected ridetime",
  setClicknearestridetime: (newText) => set({ clicknearestridetime: newText }),
}));
export const useGetboundaryStore = create((set) => ({
  boundary: "no selected boundary",
  setBoundary: (newText) => set({ boundary: newText }),
}));
export const useClicknearestgetofftimeStore = create((set) => ({
  clicknearestgetofftime: "no selected getofftime",
  setClicknearestgetofftime: (newText) => set({ clicknearestgetofftime: newText }),
}));
export const useColorareaStore = create((set) => ({
  colorarea: [],
  setColorarea: (newText) => set({ colorarea: newText }),
}));

export const useGraphdataStore = create((set) => ({
  clickdata: "未選択です",
  setClickarea: (newText) => set({ clickdata: newText }),
}));
export const useApirouteStore = create((set) => ({
  apiroute: "",
  setApiroute: (newText) => set({ apiroute: newText }),
}));
export const useRenderStore = create((set) => ({
  rendered: false,
  setRendered: (rendered) => set({ rendered: !rendered }),
}));

// ★submit〜レスポンス受信までのローディング表示用（Global）。
// FundamentalVisualize.jsx配下の各タブ（Jmds/Drm/Render_polygon/Render_route/Make_mesh/
// Mesh_address/Mesh_area/Spatial_impact/Chronogical_impact/Liptrender）はどれも
// 「フォームsubmit→fetch→レスポンス受信」という同じ流れを持つため、
// 個別にuseStateを持たせず、この1つのストアを共有する。
// （FundamentalVisualize.jsx側でこのloadingを見て、タブ内容の上にオーバーレイを重ねる）
export const useLoadingStore = create((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
export const useBusNetworkStore = create((set) => ({
  selectedRoute: null,
  selectedTimeSlot: '09-18',
  nearestBusStop: null,
  accessibleDestinations: [],
  accessibilityScore: 0,
  matrix: {},
  
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setNearestBusStop: (stop) => set({ nearestBusStop: stop }),
  setAccessibleDestinations: (destinations) => set({ accessibleDestinations: destinations }),
  setAccessibilityScore: (score) => set({ accessibilityScore: score }),
  setMatrix: (matrix) => set({ matrix }),
  setNetworkData: (data) => set({
    nearestBusStop: data.busStop,
    accessibleDestinations: data.destinations,
    accessibilityScore: data.score,
    matrix: data.matrix,
  }),
}));
