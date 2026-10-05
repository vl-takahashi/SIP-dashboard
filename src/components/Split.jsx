import React from 'react';
import { useEffect, useRef } from 'react'
import Split from 'split.js'
import UpdateLayers from './FutureRenderLayers';

export default function SplitPane() {
  const splitRef = useRef(null)

  useEffect(() => {
    const instance = Split(['#left', '#right'], {
      sizes: [30, 70],
      minSize: [200, 300],
      gutterSize: 6,
      onDrag: (sizes) => console.log(sizes), // ドラッグ中のサイズ取得
    })

    // アンマウント時にクリーンアップ
    return () => instance.destroy()
  }, [])

  return (
    <div style={{ display: 'flex', height: '50vh' }}>
      <div id="left"><UpdateLayers/></div>
      <div id="right"><UpdateLayers/></div>
    </div>
  )
}