import { useRef,useMemo } from "react";

import {useDataStore} from "./useStore";
import { mapboxAccessToken, mapstyle,initialCheck,vividColors } from "./Globalvariable";


const EditLine=async(latlon)=> {

  const data = useDataStore.getState().data
  const setData = useDataStore.getState().setData
        const token="pk.eyJ1IjoidGFrLXkiLCJhIjoiY2tnbjFpN3RiMDMwczM3bXNkem9sbm5zZCJ9.TK7AsKUUkR0kicGCyFWBsQ";
      const layers_row = [];
        let line_string_part = {
        "type": "FeatureCollection"
        };
        console.log(latlon);
        let new_Leg=[];
        let new_leg=[];
        let json_polyline_part;
        let json_point_part;
        let new_leg_part=[];
        let line_string=[];
        let point={};
        point["features"]=[]
        point["features"][0]={};
        point["features"][0]["type"]="Feature";
        point["features"][0]["geometry"]={};
        point["features"][0]["geometry"]["coordinates"]={};
        line_string["features"]=[];
        line_string["features"][0]={};
        line_string["features"][0]["type"]="Feature";
        line_string_part["features"]=[];
        line_string_part["features"][0]={};
        line_string_part["features"][0]["type"]="Feature";
        line_string_part["features"][0]["geometry"]={};
        line_string_part["features"][0]["geometry"]["type"]="LineString";

        line_string_part["features"][0]["geometry"]["coordinates"]=[];
        let point_part = {
        "type": "FeatureCollection"
        };
        point_part["features"]=[]
        point_part["features"][0]={};
        point_part["features"][0]["type"]="Feature";
        point_part["features"][0]["geometry"]={};
        point_part["features"][0]["geometry"]["type"]="MultiPoint";
        point_part["features"][0]["geometry"]["coordinates"]=[];
        let number=0;
        for (let s=0;s<latlon.length-1;s++) {
            let beforelat=latlon[s][1];
            let afterlat=latlon[s+1][1];
            let beforelon=latlon[s][0];
            let afterlon=latlon[s+1][0];
            console.log(afterlat);

            const fetchRoute = async () => {
            let url = `https://api.mapbox.com/directions/v5/mapbox/driving/` +
                `${beforelon},${beforelat};${afterlon},${afterlat}` +
                `?geometries=geojson&access_token=${token}`

            let res = await fetch(url)
            if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`)
            
            return res.json()
            }
            let leg=await fetchRoute(latlon, token);
            let legs=leg.routes[0].geometry.coordinates;
            console.log(legs);
            let duration=leg.routes[0].duration;
            let distance=leg.routes[0].distance;
            console.log(legs);
            for (let step=0;step<legs.length;step++){
                let leg_lon=legs[step][0];
                let leg_lat=legs[step][1];
                new_leg.push([leg_lon,leg_lat]);
                new_leg_part.push([leg_lon,leg_lat]);
                new_Leg.push([leg_lon,leg_lat]);
            };
            let new_polyline=[];
            for (let step=0;step<legs.length;step++){
                try {
                    let l=getDistance(new_leg[step][1],new_leg[step][0],new_leg[step+1][1],new_leg[step+1][0]);
                    console.log(l);
                    line_string_part["features"][0]["geometry"]["coordinates"]=new_leg_part;
                    let leg_lat=legs[step][1];
                    let leg_lon=legs[step][0];
                    console.log([leg_lat,leg_lon]);
                    new_polyline.push([leg_lat,leg_lon])
                    let line0_l=[leg_lon,leg_lat];
                } catch {
                    line_string_part["features"][0]["geometry"]["coordinates"]=new_leg_part;
                    let leg_lat=legs[step][1];
                    let leg_lon=legs[step][0];
                    console.log([leg_lat,leg_lon]);
                    new_polyline.push([leg_lat,leg_lon]);
                };
                
            };
            console.log(new_polyline);
            let pl_part=[];
            let arr_part=[];
            let pl=[];
            let arr=[];
            for (let s=0;s<number-1;s++){
                arr.push([latlon[-2][1],latlon[-2][0]]);
                pl.push(String(s+1));
                arr_part.push([latlon[-2][1],latlon[-2][0]]);
                pl_part.push(String(s+1));
            };
            let result_part = [...new Set(arr_part.map(JSON.stringify))].map(JSON.parse);
            let result = [...new Set(arr.map(JSON.stringify))].map(JSON.parse);
            const arrayB = Array.from(new Set(pl));
            console.log(line_string_part);
            point["features"][0]["geometry"]["coordinates"]=result;
            const arrayB_part = Array.from(new Set(pl_part));
            console.log(latlon);
            point_part["features"][0]["geometry"]["coordinates"].push([latlon[latlon.length-2][1],latlon[latlon.length-2][0]]);
            point_part["features"][0]["geometry"]["coordinates"].push([latlon[latlon.length-1][1],latlon[latlon.length-1][0]]);
        
        };
        const geojsonString = line_string_part;
        console.log(geojsonString);
        // 3. ファイルとしてダウンロードさせる場合（ブラウザ環境）
        const blob = new Blob([geojsonString], { type: "application/json" });
    setData(geojsonString,"editline");
}
export default EditLine;