import React from 'react';
import {createContext, useContext,useState,useEffect} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
const AllRender = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

    const fetchDataAsync = async (formData) => {
        
    await fetch(`http://52.62.35.205:5000/existed`,{
                        
                          method: 'POST',
                          body: formData}) // data.json ファイルを非同期で取得
                          .then(res => 
                          res.json())
                          .then(data => {
                            // 4. point
                            console.log(data);
                            for (let d=0; d<data.data.length;d++){
                              let d0=data.data[d];
                              let dp=data.property[d];
                              data_existed.push({property:dp,data:d0});
                              
  
                            }
                              
                              console.log(data_existed);
                              setData(data_existed); 
                            })
                          .catch(error => {
                            console.log(error);
                              //modalDialog.close();
                          });
    };
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
            <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
                e.preventDefault(); // リロード防止
                try{
                  let fileInput = document.getElementById('allfileInput');
                  let formData = new FormData();
                  let data_existed=[];
              
                  let file = fileInput.files;

                  
                  if (file.length === 0) {
                      
                      console.log('Please select a file first!');
                      return;
                  }
                  console.log(file);
              
                  // 'file' must match the key used in request.files['file'] on the server
                  for (let f=0;f<file.length;f++){
                    formData.append('file', file[f]); 
              
                  }
                  fetchDataAsync();
                } catch(e) {
                }
              }}>
                <input type="file" webkitdirectory="true" name="file" id="allfileInput"/>
                <input type="submit" value="Upload"/>
            </form>
            <button onClick={onClose}>閉じる</button>
        </div>
        </div>
    );
  };

export default AllRender;
