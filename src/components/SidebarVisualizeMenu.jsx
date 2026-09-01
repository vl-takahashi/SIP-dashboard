import React from 'react';
import {createContext, useContext,useState,useEffect} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';

import FacilityRender from './FacilityRender';
import PolygonRender from './PolygonRender';
import Lipt from './LiptRender';
import Dtsb from './DtsbRender';
import MachiRender from './MachiRender';
import AllRender from './AllRender';
import {initialCheck,initialData,mapboxAccessToken,mapstyle,tooltipHandler} from "./Globalvariable";
import { visualizemenu } from "./Globalvariable"

const SidebarVisualizemenu = () => {
  const [ isdtsb, setDtsb ] = useState("false");
  const [ ismachi, setMachi ] = useState("false");
      
  const [isvisible,setVisible]=useState("false");
  const [isfacility,setFacility]=useState("false");
  const [ispolygon,setPolygon]=useState("false");
  const [ispoint,setPoint]=useState("");
  const menu_route = (countState, action)=> {
  // 初期ビューポートの設定
  const INITIAL_VIEW_STATE = {
      longitude: 132.74344,
      latitude: 34.4309131,
      bearing: 0,
      pitch: 0,
      zoom: 12,
  };
 
  return (
    <div className='visualize'>
      <ul className='menu' style={{listStyle:'none', padding:0, margin:0}}>
        {visualizemenu.map((item, index) => (
                <li key={index+"_r2"} style={{
                  margin: "10px 0",
                  padding: "12px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minWidth: "0"
                }}>
                  <div style={{flex:1}}>
                    <button
                      type="button"
                      id={item.route}
                      key={index}
                      onClick={openModal}
                      style={{
                        backgroundColor: "#0066cc",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500"
                      }}
                    >
                      {item.menu}
                    </button>
                  </div>

                  {/* ★ガイドラインへのリンク */}
                  {item.guideline && (
                    <a
                      href={`${window.location.origin}/docs/guideline.html${item.guideline}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="ガイドラインを表示"
                      style={{
                        marginLeft: "8px",
                        fontSize: "16px",
                        color: "#ff9800",
                        textDecoration: "none",
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      ❓
                    </a>
                  )}

                    <All data={item.route} isOpen={openModal} onClose={closeModal} />
                </li>
            ))}

      </ul>
  </div>
  );
};
}
export default SidebarVisualizemenu;