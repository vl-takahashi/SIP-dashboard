import { useState, useEffect } from 'react';

// 画面幅に応じてレイアウト・文字サイズを調整するための共有フック。
//
// ブレークポイントの考え方：
//   〜1024px       : タブレット幅（本アプリが主に対応したい狭い画面）
//   1025px以上     : デスクトップ／プロジェクター投影時の通常幅
//
// 注意：古い4:3プロジェクター（1024x768等）はタブレットと同じ幅域になることがある。
// ここでの isTablet は「画面が狭いので詰めて表示する」ためのフラグであり、
// 「プロジェクターだから文字を大きくする」ためのフラグではない。
// 両方を同時に満たしたい場合（狭い解像度のプロジェクターに大きな文字で詰めて出す等）は、
// 別途「プレゼンモード」のようなトグルを用意することを検討する。
export const BREAKPOINTS = {
  tablet: 1024,
};

export function useBreakpoint() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    width,
    isTablet: width <= BREAKPOINTS.tablet,
  };
}
