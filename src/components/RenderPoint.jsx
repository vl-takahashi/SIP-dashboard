import React, { useRef, useState, useEffect } from 'react';
import { LinearProgress, Box, Typography, Alert } from '@mui/material';
import JSZip from 'jszip';
import { useDataStore, useRenderStore, useLoadingStore } from './useStore';
import { FileField, TextField, SelectField, PrimaryButton } from './VisualizeUI';

const RenderPoint = () => {
  const paramRef = useRef();
  const agencyRef = useRef();
  const filesRef = useRef();

  const data = useDataStore((state) => state.data);
  const setData = useDataStore((state) => state.setData);
  const setAgency = useDataStore((state) => state.setAgency);
  const setLoading = useLoadingStore((state) => state.setLoading);

  // 非同期 API 用の state
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // API エンドポイント
  const API_BASE = 'https://vl-sip.com/module';
  const POLL_INTERVAL = 1000; // 1秒

  /**
   * 非同期 API にリクエスト送信
   */
  const fetchPointAsync = async (formData) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. API にリクエスト送信
      const response = await fetch(`${API_BASE}/point`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Task started:', result);

      if (!result.task_id) {
        throw new Error('No task_id returned from API');
      }

      // 2. task_id を保存（ポーリング開始）
      setTaskId(result.task_id);
      setProgress(10);
    } catch (err) {
      console.error('Error starting task:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * ポーリングで結果を確認
   */
  useEffect(() => {
    if (!taskId) return;

    const pollResults = async () => {
      try {
        const response = await fetch(`${API_BASE}/result/${taskId}`);

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('Task status:', result);

        if (result.status === 'completed') {
          // 3. 完了 → データ処理
          setProgress(90);
          await handleSuccess(result.result);
          setTaskId(null);
          setProgress(100);
          setLoading(false);
        } else if (result.status === 'failed') {
          // エラー
          throw new Error(result.error || '処理に失敗しました');
        } else {
          // 処理中：プログレスを更新
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

  /**
   * API から返された結果を処理
   */
  const handleSuccess = async (data) => {
    try {
      setAgency('');
      const zip = new JSZip();
      let dpl = [];
      let fileCount = 0;

      console.log('Processing data:', data);

      for (let d in data.property) {
        let dp0 = 'area';
        dpl.push(dp0);
        let dp1 = data.filename[d];
        let d0 = data.data[d];
        let d001 = data.detail[d];

        // GeoJSON に property フィールドを追加
        d0.property = dp0;

        let data_existed = { detail: dp1, checked: true, data: d0 };
        console.log(data_existed, dp0);

        let d01 = JSON.stringify(
          {
            property: dp0,
            data: d0,
            detail: data.property[d],
            agency: '',
          },
          null,
          2
        );

        // ZIP にファイル追加
        zip.file(`point_${dp1}_metadata.json`, d01);
        let geojsonData = JSON.stringify(d0, null, 2);
        zip.file(`point_${dp1}.geojson`, geojsonData);

        setData(data_existed, dp0);
        fileCount++;
      }

      // ZIP を生成してダウンロード
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `point_${new Date().getTime()}.zip`;
      link.click();

      window.alert(
        `✅ 完了しました。\n✅ ダウンロード: ${fileCount}ファイル\n✅ レイヤー欄にも表示されます。`
      );
    } catch (err) {
      console.error('Error processing result:', err);
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

      formData.append('parameter', paramRef.current.file);
      setAgency(agencyRef.current.value);

      // 非同期 API を呼び出し
      fetchPointAsync(formData);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  return (
    <div>
      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* フォーム（処理中は非表示） */}
      {!taskId ? (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <FileField
            label="区域・メッシュファイル"
            required
            hint="CSV 形式のポイントデータを選択してください（複数選択可）。"
            inputRef={filesRef}
            accept=".csv"
            multiple
          />
          <FileField
            label="区域・メッシュファイル"
            required
            hint="CSV 形式のパラメータデータを選択してください。"
            inputRef={paramRef}
            accept=".csv"
          />
          <TextField label="グルーピング名称（任意）" inputRef={agencyRef} inline />
          <PrimaryButton disabled={!!taskId}>アップロード</PrimaryButton>
        </form>
      ) : (
        // 処理中：プログレスバー表示
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            処理中... {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Task ID: {taskId}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default RenderPoint;
