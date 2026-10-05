import React from 'react';
import {createContext, useContext,useState,useEffect} from 'react'
import Map from 'react-map-gl/mapbox';
// If using with mapbox-gl v1:
// import Map from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
const FetchTest = (props) => {
    const [test,setTest]=useState("none");
    const fetch_test=async()=>{
        let testvalue = document.getElementById("testvalue").value;
        let input =JSON.stringify({"id":parseInt(testvalue)});
        console.log(input);
        await fetch(`https://www.vl-sip/module/num?id=${testvalue}`,{
                        
                          headers: {
                            "Content-Type": "application/json"
                          },
                          method: 'POST'}) // data.json ファイルを非同期で取得
                          .then(res => 
                          res.json())
                          .then(data => {
                            // 4. point
                            console.log(data);
                            setTest(data.id);
                            })
                          .catch(error => {
                            console.log(error);
                              //modalDialog.close();
                          });
    };
    return (
          <div>
            <form action="" method="POST" onSubmit={(e) => {
                e.preventDefault(); // リロード防止
                fetch_test();
              }}>
              <p>{test}</p>
                <input type="text" name="testvalue" id="testvalue"/>
                <input type="submit" value="test"/>
            </form>
          </div>
    );
  };


export default FetchTest;
