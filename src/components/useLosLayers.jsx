import { createContext, useState,useReducer,useMemo } from "react";
import { useLosStore } from "./useStore";
import { GeoJsonLayer,TextLayer, ScatterplotLayer,IconLayer } from '@deck.gl/layers';
export function useLosLayers() {
  const data = useLosStore((state) => state.losData);

  const layers = useMemo(() => {
    return [
      new GeoJsonLayer({
        id: 'accessibility-layer',
        data: data,
      }),
    ];
  }, [data]);

  return layers;
}