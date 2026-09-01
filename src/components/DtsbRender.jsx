import React from 'react';
import {createContext, useContext,useState,useEffect} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import {DeckGL} from '@deck.gl/react';
const DtsbRender = ({isdtsb,muni}) => {
    // 初期ビューポートの設定
    const INITIAL_VIEW_STATE = {
        longitude: 132.74344,
        latitude: 34.4309131,
        bearing: 0,
        pitch: 0,
        zoom: 12,
    };
  
    function handledtsbSubmit(e) {
        e.preventDefault();
        setdtsb("true");
      }
    const fetchdtsbAsync = async () => {
    let formData=new FormData();
    let input = document.querySelector('input[name="dtsb-input"]');
    console.log(input);
    formData.append('gtfs',input.value);
    formData.append('muni',muni);
    console.log(formData);
    await fetch("https://sip-api-temporal.onrender.com/dtsb",{
                              method: 'POST',
                              headers:{
                                'Content-Type':'application/json'
                              },
                              body:formData
                            }) // data.json ファイルを非同期で取得
                              .then(res => 
                                console.log(res))
                              .then(data => {
                              // 4. JSONデータ（JavaScriptオブジェクト）を受け取る
                              
                              console.log("dtsb0");
                              for (let k=0; k<parseInt(data[0].name.length);k++){
                                  data_existed.push({name:data[0].name[k],lng:data[0].lon[k],lat:data[0].lat[k]});
                              }   
                              setDataExisted(data_existed); 
                            }
                            ).catch(err=>console.log(err))

                            
    console.log("dtsb")
    console.log(dtsb_l);
    useEffect(() => {fetchdtsbAsync()
    },[])}
    return (
      
        <div className="dtsb_select">
          <h2>dtsb</h2>
          <form onSubmit={handledtsbSubmit}>
          <input id="dtsbmuni_select" placeholder="広島県東広島市"  /> <br/>
          <input id="dtsb-input" type="file"/>
          <button type="submit" value="true" name="dtsbcity_select">dtsb診断</button>
            
          </form>
          <div className="map"
          style={{
            position: "relative"
          }}>
          </div>
        </div>
    );
  };

export default DtsbRender;

      {/*
  
          <DeckGL style={{ width: 600, height: 400 }}
            initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              layers={RenderLayers({ data: isdtsb ? dtsb :0})}
            >
            </DeckGL>*/}

