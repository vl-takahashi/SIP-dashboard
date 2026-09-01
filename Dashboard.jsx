import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Button, Alert, Card, CardContent, LinearProgress, Grid } from '@mui/material';
import AreaTab from './AreaTab';
import FileUploadPanel from './FileUploadPanel';

/**
 * ダッシュボード - タブ構成
 * タブ0: ファイルアップロード
 * タブ1: エリア分析（AreaTab）
 * タブ2: 診断結果（新規）
 */
const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState(1);
  const [popmeshData, setPopmeshData] = useState(null);
  const [ridingtimeDataArray, setRidingtimeDataArray] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);

  // 診断結果受け取り API のセットアップ
  useEffect(() => {
    setupDiagnosisAPI();
  }, []);

  const setupDiagnosisAPI = async () => {
    console.log('✅ 診断結果受け取り API をセットアップしました');

    // Tauri invoke の場合
    if (window.__TAURI__) {
      console.log('🔌 Tauri 環境で実行中');
    }
  };

  // チャットボットから診断結果を受け取る
  const handleDiagnosisReceived = (diagnosisData) => {
    console.log('📊 診断結果を受け取りました:', diagnosisData);

    // 履歴に追加
    setDiagnosisResults((prev) => [diagnosisData, ...prev]);

    // 最新の診断結果を表示
    setCurrentDiagnosis(diagnosisData);

    // 診断結果タブに切り替え
    setCurrentTab(2);

    // ステータス表示
    setUploadStatus(`✅ ${diagnosisData.userName} さんの診断結果を受け取りました`);
  };

  // ファイルアップロード処理
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadStatus('読み込み中...');

    try {
      for (let file of files) {
        const text = await file.text();
        const data = JSON.parse(text);

        // propertyごとに振り分け
        if (data.property === 'popmesh' || data.property === 'addressed') {
          setPopmeshData(data);
          setUploadStatus(`✅ ${file.name} を読み込みました（住所データ）`);
          console.log('✅ popmesh/addressed データ読み込み:', data);
        } else if (data.property === 'ridingtime_direct_dest' || data.property === 'ridingtime_transit_dest') {
          setRidingtimeDataArray((prev) => [...prev, data.data || []]);
          setUploadStatus(`✅ ${file.name} を読み込みました（乗車時間データ）`);
          console.log('✅ ridingtime データ読み込み:', data);
        }
      }

      // タブ2に切り替え
      setTimeout(() => {
        setCurrentTab(1);
      }, 1000);
    } catch (error) {
      console.error('❌ ファイル読み込みエラー:', error);
      setUploadStatus(`❌ エラー: ${error.message}`);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* タブナビゲーション */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', background: '#f5f5f5' }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="📤 ファイルアップロード" value={0} />
          <Tab label="📊 エリア分析" value={1} />
          <Tab label="📈 診断結果" value={2} />
        </Tabs>
      </Box>

      {/* タブコンテンツ */}
      <Box sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
        {/* タブ0: ファイルアップロード */}
        {currentTab === 0 && (
          <Box>
            <FileUploadPanel onFileUpload={handleFileUpload} />
            {uploadStatus && (
              <Alert
                severity={uploadStatus.startsWith('✅') ? 'success' : 'error'}
                sx={{ marginTop: 2 }}
              >
                {uploadStatus}
              </Alert>
            )}
          </Box>
        )}

        {/* タブ1: エリア分析 */}
        {currentTab === 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AreaTab
              popmeshData={popmeshData}
              ridingtimeDataArray={ridingtimeDataArray}
            />
          </Box>
        )}

        {/* タブ2: 診断結果 */}
        {currentTab === 2 && (
          <Box>
            {currentDiagnosis ? (
              <DiagnosisResultPanel diagnosis={currentDiagnosis} />
            ) : (
              <Alert severity="info">
                チャットボットから診断結果を待機中...
              </Alert>
            )}

            {/* 診断結果履歴 */}
            {diagnosisResults.length > 0 && (
              <Box sx={{ marginTop: 3 }}>
                <h3>📋 診断結果履歴</h3>
                <Grid container spacing={2}>
                  {diagnosisResults.map((result, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 3 },
                        }}
                        onClick={() => setCurrentDiagnosis(result)}
                      >
                        <CardContent>
                          <div style={{ fontSize: '14px' }}>
                            <strong>{result.userName}</strong>
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(result.timestamp).toLocaleString('ja-JP')}
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '13px' }}>
                            <div>🎯 {result.diagnosis?.pointiness || 0}%</div>
                          </div>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

/**
 * 診断結果パネルコンポーネント
 */
const DiagnosisResultPanel = ({ diagnosis }) => {
  if (!diagnosis) return null;

  const scoreItems = [
    { label: 'ピンポイント性', value: diagnosis.diagnosis?.pointiness },
    { label: '冗長性', value: diagnosis.diagnosis?.redundancy },
    { label: 'ライフスタイル達成度', value: diagnosis.diagnosis?.lifestyle },
    { label: '経済的実行可能性', value: diagnosis.diagnosis?.economic },
  ];

  return (
    <Card sx={{ maxWidth: 800, margin: '0 auto' }}>
      <CardContent>
        <h2>📊 診断結果</h2>

        {/* ユーザー情報 */}
        <Box sx={{ marginBottom: 2 }}>
          <strong>ユーザー:</strong> {diagnosis.userName}
          <div style={{ fontSize: '12px', color: '#999' }}>
            {new Date(diagnosis.timestamp).toLocaleString('ja-JP')}
          </div>
        </Box>

        {/* 回答内容 */}
        <Box sx={{ marginBottom: 2, padding: 1, background: '#f5f5f5', borderRadius: 1 }}>
          <strong>📝 回答内容</strong>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            {diagnosis.answers?.q1?.value && (
              <div>目的地: {diagnosis.answers.q1.value}</div>
            )}
            {diagnosis.answers?.q2?.value && (
              <div>乗車地: {diagnosis.answers.q2.value}</div>
            )}
            {diagnosis.answers?.q3?.value && (
              <div>
                時間: {String(diagnosis.answers.q3.value).padStart(2, '0')}:00
              </div>
            )}
            {diagnosis.answers?.q5?.frequency_per_month && (
              <div>頻度: {diagnosis.answers.q5.frequency_per_month}回/月</div>
            )}
            {diagnosis.answers?.q6?.budget_max && (
              <div>予算: 〜{diagnosis.answers.q6.budget_max}円/月</div>
            )}
          </div>
        </Box>

        {/* 診断スコア */}
        <Box>
          <strong>⭐ 診断スコア</strong>
          <Box sx={{ marginTop: 2 }}>
            {scoreItems.map((item) => (
              <Box key={item.label} sx={{ marginBottom: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 0.5,
                  }}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.value || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: `hsl(${(item.value / 100) * 120}, 70%, 50%)`,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
