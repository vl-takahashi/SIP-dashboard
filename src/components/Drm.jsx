import React from 'react';
import {createContext, useContext,useState,useEffect} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useLoadingStore } from "./useStore";
import { PrimaryButton } from "./VisualizeUI";
const Drm = () => {
  // submit〜レスポンス受信までFundamentalVisualize側にローディング表示を出すための共有state
  const setLoading = useLoadingStore((state) => state.setLoading);
  function handledrmSubmit(e) {
    e.preventDefault(); // これが必要
      const fetchdrmAsync = async () => {
setLoading(true); // ★ここから応答待ち
await fetch("http://52.62.35.205:5000/drm",{

                            method: 'GET'}) // data.json ファイルを非同期で取得
                            .then(res =>
                            res.json())
                            .then(data => {
                              // 4. point
                              console.log(data);
                            }
                            )
                            .catch(error => {
                              // ネットワークエラーなどをログに記録
                              console.error('Fetch error:', error);
                            })
                            .finally(() => setLoading(false)); // ★成功・失敗どちらでも必ず解除
      };
    fetchdrmAsync();
  }
    return (
        <div className="drm_select">
          <form onSubmit={handledrmSubmit}>
            <PrimaryButton value="true" name="drmcity_select">DRM接続テスト</PrimaryButton>
          </form>
        </div>
    );
  }
export default Drm;