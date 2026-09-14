import {refreshJsonData,nextJsonData} from "./useStore";
import React,{useRef,useState} from 'react';
// import FolderUpload from "./Folderupload.jpg"; // File not found

const ExistedData=()=>{
    const dirRef=useRef();
    let n=0

  // 📌 sessionId を URL クエリから取得（テナント隔離）
  const getSessionIdFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sessionId');
  };

  const fetch = async (n) => {
      const dirHandle = await window.showDirectoryPicker();
      n+=1;

      // ✅ シンプル設計：アップロード時に新しい sessionId を生成
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', newSessionId); // sessionStorage に保存

      console.log(`📌 新しいセッション ID を生成: ${newSessionId}`);

      if (n==0){

        // ✅ シンプル設計：新しいセッションに直接保存
        console.log(`🔄 transit-data を新しいセッションに保存中 (sessionId=${newSessionId})...`);
        await refreshJsonData(dirHandle, newSessionId, "ridingtime_direct_dest");
      } else {

        // ✅ シンプル設計：新しいセッションに直接保存
        console.log(`🔄 transit-data を新しいセッションに保存中 (sessionId=${newSessionId})...`);
        await nextJsonData(dirHandle, newSessionId, "ridingtime_direct_dest");
      };
    }
  return (
    <div>
        <button type="button" ref={dirRef} onClick={()=>fetch()} style={{backgroundColor: '#08335c',padding: 3 }}><font color="white">PCからアップロード</font></button>
    </div>
  )
}
export default ExistedData;