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
      const sessionId = getSessionIdFromURL();
      console.log(`📌 sessionId from URL: ${sessionId}`);

      if (n==0){
        // 📌 sessionId と propertyFilter を指定
        await refreshJsonData(dirHandle, sessionId, "ridingtime_direct_dest");
      } else {
        await nextJsonData(dirHandle);
      };
    }
  return (
    <div>
        <button type="button" ref={dirRef} onClick={()=>fetch()} style={{backgroundColor: '#08335c',padding: 3 }}><font color="white">PCからアップロード</font></button>
    </div>
  )
}
export default ExistedData;