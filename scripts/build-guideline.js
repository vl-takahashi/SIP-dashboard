#!/usr/bin/env node

/**
 * Markdown ガイドラインを HTML に変換するスクリプト
 * 使用方法: node scripts/build-guideline.js
 */

const fs = require('fs');
const path = require('path');

// markdownit のインストール確認
let md;
try {
  const MarkdownIt = require('markdown-it');
  md = new MarkdownIt({ html: true, linkify: true });
} catch (e) {
  console.error('❌ エラー: markdown-it がインストールされていません');
  console.error('実行コマンド: npm install markdown-it --save-dev');
  process.exit(1);
}

const mdFilePath = path.join(__dirname, '../public/docs/guideline.md');
const htmlFilePath = path.join(__dirname, '../public/docs/guideline.html');

// Markdown を読み込み
if (!fs.existsSync(mdFilePath)) {
  console.error(`❌ エラー: ${mdFilePath} が見つかりません`);
  process.exit(1);
}

const markdownContent = fs.readFileSync(mdFilePath, 'utf-8');

// HTML に変換
const htmlContent = md.render(markdownContent);

// HTML テンプレートでラップ
const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>公共交通ダッシュボード ガイドライン</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background-color: #f5f5f5;
        }
        h1 {
            color: #0066cc;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 10px;
        }
        h2 {
            color: #0088dd;
            margin-top: 30px;
            padding: 10px;
            background-color: #e6f2ff;
            border-left: 4px solid #0066cc;
        }
        h3 {
            color: #005fa3;
        }
        section {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        ul, ol {
            margin: 15px 0;
        }
        li {
            margin: 8px 0;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background-color: white;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        table th {
            background-color: #0066cc;
            color: white;
        }
        hr {
            border: none;
            border-top: 2px solid #ddd;
            margin: 30px 0;
        }
        footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    ${htmlContent}
    <footer>
        <p>このガイドラインは定期的に更新されます。最新版を確認してください。</p>
        <p><em>自動生成: guideline.md から HTML に変換されました</em></p>
    </footer>
</body>
</html>`;

// HTML を保存
fs.writeFileSync(htmlFilePath, fullHtml, 'utf-8');

console.log('✅ ガイドライン HTML を生成しました');
console.log(`📄 入力: ${mdFilePath}`);
console.log(`💾 出力: ${htmlFilePath}`);
