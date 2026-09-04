const data2r = result.features
              .map((e) => {
                // プロパティ初期化
                e.properties["to"] = null;
                e.properties["weekday"] = null;
                e.properties["hour"] = null;
                e.properties["direct"] = null;
                e.properties["dest"] = null;
                e.properties["origdest"] = null;
                e.properties["directrideonstop"] = [];
                e.properties["directgetoffstop"] = [];
                e.properties["directridingtime"] = [];
                e.properties["directrideontime"] = [];
                e.properties["directgetofftime"] =[];
                e.properties["directexceptionserviceday"] = [];
                e.properties["directroute"] = [];
                e.properties["directagency"] = [];
                e.properties["directdimention"] = [];
                // データをマッチさせて更新
                
                for (const i of flag) {
                    
                  if (i["condition"]["weekday"][s02]==="1"&&i["condition"]["direct"]==="direct"){
                    const flagr0 = i["data"].map(item => item.directmeshid);
                    e.properties["dimention"] = i["condition"]["dimention"];
                    e.properties["to"] = i["condition"]["to"];
                    e.properties["dest"] = i["condition"]["to"];
                    e.properties["weekday"] = i["condition"]["weekday"];
                    e.properties["hour"] = i["condition"]["hour"];
                    e.properties["direct"] = d2;
                    e.properties["dest"] = d3;
                    let rideonstop=i["data"].map(u=>u.directrideonstop);
                    let getoffstop=i["data"].map(u=>u.directgetoffstop);
                    let ridingtime=i["data"].map(u=>u.directridingtime);
                    let rideontime=i["data"].map(u=>u.directrideontime);
                    let getofftime=i["data"].map(u=>u.directgetofftime);
                    let exceptionserviceday=i["data"].map(u=>u.directexceptionserviceday);
                    let route=i["data"].map(u=>u.route);
                    let agency=i["data"].map(u=>u.agency);
                    let index=flagr0.findIndex(row => row.includes(e.properties["MESH_ID"]));
                    if (index!=-1){
                      e.properties["directrideonstop"]=rideonstop[index];
                      e.properties["directgetoffstop"]=getoffstop[index];
                      e.properties["directridingtime"]=ridingtime[index];
                      e.properties["directrideontime"]=rideontime[index];
                      e.properties["directgetofftime"]=getofftime[index];
                      e.properties["directexceptionserviceday"]=exceptionserviceday[index]; // = に修正
                      e.properties["directroute"]=route[index]; // = に修正
                      e.properties["directagency"]=agency[index]; // = に修正
                      break; // マッチしたら終了
                    }
                    }
                  }
                return e;
              })
              