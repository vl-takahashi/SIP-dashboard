import React, { lazy, Suspense } from 'react';
import { FieldLabel, FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";
import {useDataStore,useDestStore,useOrigStore,usePooledweekdayStore,useWeekdayStore,useLoadingStore} from "./useStore";
  //reducer関数を作成
const Exportallgeojson=()=> {
    const ridingtimeall = useDataStore((state) => state.ridingtimeall);

  const handleSubmit = (e) => {
    e.preventDefault();
    for (let l in ridingtimeall){

    let metadataLink1 = document.createElement("a");
    let to=ridingtimeall[l].features[0].properties["to"]
    let direct=ridingtimeall[l].features[0].properties["direct"]
    let dest=ridingtimeall[l].features[0].properties["dest"]
    let d001 = JSON.stringify({
    type: "FeatureCollection",
    features: ridingtimeall[l]
      }, null, 2);
    let metadataBlob1 = new Blob([d001], { type: 'application/json' });
      metadataLink1.href = URL.createObjectURL(metadataBlob1);
      metadataLink1.download = `chronogical_${direct}_${dest}_${to}.geojson`;
      metadataLink1.click();
    }
  }
  return (
<div>
    <form action="" method="POST" encType="multipart/form-data" onSubmit={handleSubmit}>
    <PrimaryButton value="fare">色付きメッシュのエクスポート</PrimaryButton>
    </form>
</div>
           )
}
export default Exportallgeojson;