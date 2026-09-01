import {refreshJsonData,nextJsonData} from "./useStore";
import React,{useRef,useState} from 'react';
import FolderUpload from "./Folderupload.jpg";

const ExistedData=()=>{
    const dirRef=useRef();
    let n=0
  const fetch = async (n) => {
      const dirHandle = await window.showDirectoryPicker();
      n+=1;
      if (n==0){
        await refreshJsonData(dirHandle);
      } else {
        await nextJsonData(dirHandle);

      };
    }
  return (
    <>
        <button type="button" ref={dirRef} onClick={()=>fetch()} style={{backgroundColor: '#08335c',padding: 3 }}><font color="white">PCからアップロード</font></button>
    </>
  )
}
export default ExistedData;