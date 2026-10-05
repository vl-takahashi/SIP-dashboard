import { createContext, useState,useReducer,useMemo } from "react";
import { useDemandStore } from "./useStore";
;
export function useDemandLayers() {
  const data = useDemandStore((state) => state.demandData);

  const layers = useMemo(() => {
    return [
      new GeoJsonLayer({
        id: 'demand-layer',
        data,
        // ...既存のプロパティはそのまま移植
      }),
    ];
  }, [data]);

  return layers; // Mapは返さない、レイヤーだけ
}