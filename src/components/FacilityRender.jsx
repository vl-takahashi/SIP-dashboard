import React from 'react'
const FacilityRender = ({facility}) => {
  function handleFacilitySubmit(e) {
    e.preventDefault();
    setPoint(e.target.value);
    console.log(muni);
    let formData=new FormData();
    let point_inputfile = document.querySelectorAll('input[name="point-inputfile"]');
    let name_input = document.querySelectorAll('input[name="point-name"]');
    let lat_input = document.querySelectorAll('input[name="point-lat"]');
    let lon_input = document.querySelectorAll('input[name="point-lon"]');
    let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let l1=[[],[],[]];
    for (let i=0;i<name_input.length;i++){
      l1[0].push(name_input[i]);
      l1[1].push(lat_input[i]);
      l1[2].push(lon_input[i]);
    }
    let blob = new Blob([bom, l1],{type:"text/csv"});
    formData.append('input_file',point_inputfile.value);
    formData.append('parameter_file',blob);
    let data_l=[];
      const fetchDataAsync = async () => {
      await fetch("https://sip-api-temporal.onrender.com/point",{
                                
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
    file.name="point-inputfile";
    let name=document.createElement("input");
    name.type="text";
    name.name="point-name";
    let lat=document.createElement("input")
    lat.type="text";
    lat.name="point-lat";
    let lon=document.createElement("input")
    lon.type="text";
    lon.name="point-lon";
    file.appendChild(file);
    file.appendChild(name);
    file.appendChild(lat);
    file.appendChild(lon);
    let point_input_form = document.getElementById("point-input-form");
    point_input_form.appendChild(file)
  }
  return (
    <div>
      
      <h2>目的施設可視化</h2>
          <form onSubmit={handleFacilitySubmit}>
            <div name="point-input-form" id="point-input-form">
              <input name="point-lat" placeholder="広島県東広島市"  /> <br/>
              <input name="point-lon" placeholder="広島県東広島市"  /> <br/>
              <input name="point-inputfile" type="file"/>
            </div>
            <button value="true" name="input-increment" onClick={handleFileIncrement}>ファイル追加</button>
            <button type="submit" value="true" name="point_select">ポイント表示</button>
              
          </form>
    　
    </div>
  );
};

export default FacilityRender;