import React from 'react'
const PolygonRender = ({Polygon}) => {
  function handlePolygonSubmit(e) {
    e.preventDefault();
    setpolygon(e.target.value);
    console.log(muni);
    let formData=new FormData();
    let polygon_inputfile = document.querySelectorAll('input[name="polygon-inputfile"]');
    let name_input = document.querySelectorAll('input[name="polygon-name"]');
    let lat_input = document.querySelectorAll('input[name="polygon-lat"]');
    let lon_input = document.querySelectorAll('input[name="polygon-lon"]');
    let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let l1=[[],[],[]];
    for (let i=0;i<name_input.length;i++){
      l1[0].push(name_input[i]);
      l1[1].push(lat_input[i]);
      l1[2].push(lon_input[i]);
    }
    let blob = new Blob([bom, l1],{type:"text/csv"});
    formData.append('input_file',polygon_inputfile.value);
    formData.append('parameter_file',blob);
    let data_l=[];
      const fetchDataAsync = async () => {
      await fetch("https://sip-diagnosis-663815372380.asia-northeast1.run.app/polygon",{
                                
                                method: 'POST',
                                headers:{
                                  'Content-Type':'application/json'
                                },
                                body:formData}) // data.json ファイルを非同期で取得
                                .then(res => 
                                res.json())
                                .then(data => {
                                // 4. JSONデータ（JavaScriptオブジェクト）を受け取る
                                let data0=data[0]
                                for (let k0=0; k0<parseInt(data[0].length);k0++){
                                  for (let k=0; k<parseInt(data[k0][0].name.length);k++){
                                      data_l.push({name:data[k0][0].name[k],lng:data[k0][0].lon[k],lat:data[k0][0].lat[k]});
                                    }   
                                  }
                                }
                              )
      setData(data_l)}
      console.log(data_l);
    useEffect(() => {fetchDataAsync()
    },[])
  }
  function handleFileIncrement(e){
    let file=document.createElement("input");
    file.type="file";
    file.name="polygon-inputfile";
    let name=document.createElement("input");
    name.type="text";
    name.name="polygon-name";
    let lat=document.createElement("input")
    lat.type="text";
    lat.name="polygon-lat";
    let lon=document.createElement("input")
    lon.type="text";
    lon.name="polygon-lon";
    file.appendChild(file);
    file.appendChild(name);
    file.appendChild(lat);
    file.appendChild(lon);
    let polygon_input_form = document.getElementById("polygon-input-form");
    polygon_input_form.appendChild(file)
  }
  return (
    <div>
      
      <h2>目的施設可視化</h2>
          <form onSubmit={handlePolygonSubmit}>
            <div name="polygon-input-form" id="polygon-input-form">
              <input name="polygon-lat" placeholder="広島県東広島市"  /> <br/>
              <input name="polygon-lon" placeholder="広島県東広島市"  /> <br/>
              <input name="polygon-inputfile" type="file"/>
            </div>
            <button value="true" name="input-increment" onClick={handleFileIncrement}>ファイル追加</button>
            <button type="submit" value="true" name="polygon_select">ポイント表示</button>
              
          </form>
    　
    </div>
  );
};

export default PolygonRender;