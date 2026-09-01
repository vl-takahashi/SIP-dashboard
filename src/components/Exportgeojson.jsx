import React, { lazy, Suspense } from 'react';
import { FieldLabel, FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";
import {useDataStore,useDestStore,useOrigStore,usePooledweekdayStore,useWeekdayStore,useLoadingStore} from "./useStore";
  //reducer関数を作成
const Exportgeojson=()=> {
    const ridingtime = useDataStore((state) => state.ridingtime);

  const handleSubmit = (e) => {
    e.preventDefault();
    const metadataLink1 = document.createElement("a");
          const d001 = JSON.stringify({
    type: "FeatureCollection",
    features: ridingtime
      }, null, 2);
      const metadataBlob1 = new Blob([d001], { type: 'application/json' });
      metadataLink1.href = URL.createObjectURL(metadataBlob1);
      metadataLink1.download = `chronogical.geojson`;
      metadataLink1.click();
  }
  return (
<div>
    <form action="" method="POST" encType="multipart/form-data" onSubmit={handleSubmit}>
    <PrimaryButton value="fare">色付きメッシュのエクスポート</PrimaryButton>
    </form>
</div>
           )
}
export default Exportgeojson;