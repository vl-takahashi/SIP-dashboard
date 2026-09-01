import React, { useRef } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

/**
 * ファイルアップロードパネル
 * JSONファイル（popmesh/addressed, ridingtime_direct_dest）をアップロード
 */
const FileUploadPanel = ({ onFileUpload = () => {} }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
      {/* ヘッダー */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          📤 JSONファイルアップロード
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          下記のJSONファイルをアップロードしてください
        </Typography>
      </Box>

      {/* 必要なファイル一覧 */}
      <Paper sx={{ padding: 2, marginBottom: 3, background: '#f9f9f9' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          必要なファイル:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="住所データ"
              secondary="popmesh_250_*.json または addressed.json"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="乗車時間データ"
              secondary="chronogical_ridingtime_directto*.json"
            />
          </ListItem>
        </List>
      </Paper>

      {/* ファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* アップロードボタン */}
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => fileInputRef.current?.click()}
        sx={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        📁 JSONファイルを選択
      </Button>

      {/* 説明 */}
      <Box sx={{ marginTop: 3, padding: 2, background: '#E3F2FD', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 1 }}>
          ℹ️ 複数のファイルを一度に選択できます
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 1 }}>
          ℹ️ ファイルアップロード後、「📊 エリア分析」タブに自動で切り替わります
        </Typography>
        <Typography variant="caption">
          ℹ️ エリア分析タブで住所を入力して、アクセシビリティマトリックスを表示します
        </Typography>
      </Box>
    </Box>
  );
};

export default FileUploadPanel;
