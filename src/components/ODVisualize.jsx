import React from 'react';
import { useRef, useState } from "react";
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import RenderRoute from './RenderRoute';
import MakeMesh from './MakeMesh';
import Visualization from"./visualization.png";
import Jmds from './Jmds';
import Drm from './Drm';
import MeshAddress from './MeshAddress';
import MeshArea from './MeshArea';
import TripVisualize from "./TripVisualize"
import TriptimeVisualize from "./TriptimeVisualize"
import TriptimeasMeshVisualize from "./TriptimeasMeshVisualize"
import Liptrender from './LiptRender';
import { useLoadingStore } from "./useStore";
// 配色トークンはglobalvariable.jsxに集約（AccessibilityTab.jsx等の他画面とも共有する）
import { COLORS } from "./Globalvariable";
// タブレット幅（狭い画面）かどうかを判定する共有フック。プロジェクター等の解像度差にも使う想定。
import { useBreakpoint } from "./useBreakpoint";
// 各フォーム共通の見た目パーツ（カード枠等）
import { VisualizeCard } from "./VisualizeUI";

// 10個のフォームコンポーネントを機能別に4カテゴリへ整理。
// カテゴリ（横タブ）→カード（VisualizeCard）の2階層構成にする。
const categories = [
  {
    label: 'OD可視化',
    description: 'バス停・人口メッシュ・時刻表から、公共交通のアクセス圏域（空白地域）を算出します。',
    // このカテゴリのみ、2つの算出フォームを横並びのサブタブで切り替える
    subTabs: true,
    cards: [
      {
        title: 'パス表示',
        badge: 'OD可視化',
        description: '線分表示します',
        node: <TripVisualize />,
      },
      {
        title: 'メッシュ表示',
        badge: 'メッシュ表示',
        description: 'メッシュ表示します',
        node: <TriptimeasMeshVisualize />,
      },
    ],
  },
  {
    label: 'データ処理',
    description: '人口メッシュデータに住所・区域などの属性情報を付与します。',
    cards: [
      {
        title: '住所割り当て',
        badge: 'データ処理',
        description: '人口メッシュに、地域区分ファイルから住所情報を付与します。',
        node: <MeshAddress />,
      },
      {
        title: '区域割り当て',
        badge: 'データ処理',
        description: '人口メッシュに、地域区分ファイルから区域情報を付与します。',
        node: <MeshArea />,
      },
    ],
  },
  {
    label: '外部診断',
    description: '外部データ基盤（JMDS／DRM）や診断ツール（LIPT）との接続・実行を確認します。',
    cards: [
      {
        title: 'JMDS接続テスト',
        badge: '外部診断',
        description: 'JMDS（モビリティデータ基盤）への接続を確認します。',
        node: <Jmds />,
      },
      {
        title: 'DRM接続テスト',
        badge: '外部診断',
        description: 'DRM（道路データ基盤）への接続を確認します。',
        node: <Drm />,
      },
      {
        title: 'LIPT診断',
        badge: '外部診断',
        description: '市区町村名とGTFSデータをもとにLIPT診断を実行します。',
        node: <Liptrender />,
      },
    ],
  },
];

const ODVisualize = () => {
  const filesRef = useRef();
  const agencyRef = useRef();
  const setData = useDataStore((state) => state.setData);
  const setAgency = useDataStore((state) => state.setAgency);
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const API_BASE = 'https://vl-sip.com/module';
  const API_ENDPOINT = 'od_visual';
  const POLL_INTERVAL = 1000;

  const fetchDataAsync = async (formData) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await fetch(`${API_BASE}/${API_ENDPOINT}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.json();
      if (!result.task_id) throw new Error('No task_id returned');

      setTaskId(result.task_id);
      setProgress(10);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;

    const pollResults = async () => {
      try {
        const response = await fetch(`${API_BASE}/result/${taskId}`);
        if (!response.ok) throw new Error('Status check failed');

        const result = await response.json();

        if (result.status === 'completed') {
          setProgress(90);
          await handleSuccess(result.result);
          setTaskId(null);
          setProgress(100);
          setLoading(false);
        } else if (result.status === 'failed') {
          throw new Error(result.error || '処理に失敗しました');
        } else {
          setProgress((prev) => Math.min(prev + 5, 85));
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError(err.message);
        setTaskId(null);
        setLoading(false);
      }
    };

    const interval = setInterval(pollResults, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleSuccess = async (data) => {
    try {
      setAgency('');
      const zip = new JSZip();
      let fileCount = 0;

      for (let d in data.property) {
        let dp0 = 'od';
        let dp1 = data.filename[d];
        let d0 = data.data[d];
        d0.property = dp0;

        let d01 = JSON.stringify(
          { property: dp0, data: d0, detail: data.property[d], agency: '' },
          null,
          2
        );

        zip.file(`${API_ENDPOINT}_${dp1}_metadata.json`, d01);
        zip.file(`${API_ENDPOINT}_${dp1}.geojson`, JSON.stringify(d0, null, 2));

        setData({ detail: dp1, checked: true, data: d0 }, dp0);
        fileCount++;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${API_ENDPOINT}_${new Date().getTime()}.zip`;
      link.click();

      window.alert(`✅ 完了: ${fileCount}ファイル`);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    try {
      let formData = new FormData();
      let file = filesRef.current.files;

      if (file.length === 0) {
        setError('ファイルを選択してください');
        return;
      }

      for (let f = 0; f < file.length; f++) {
        formData.append('file', file[f]);
      }

      setAgency(agencyRef.current.value);
      fetchDataAsync(formData);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  return (
    <div>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!taskId ? (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <FileField
            label="OD（出発地・目的地）ファイル"
            required
            hint="処理対象のファイルを選択してください（複数選択可）。"
            inputRef={filesRef}
            accept=".geojson,.json,.csv,.zip"
            multiple
          />
          <TextField label="グルーピング名称（任意）" inputRef={agencyRef} inline />
          <PrimaryButton disabled={!!taskId}>アップロード</PrimaryButton>
        </form>
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>処理中... {progress}%</Typography>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Task ID: {taskId}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default ODVisualize;

