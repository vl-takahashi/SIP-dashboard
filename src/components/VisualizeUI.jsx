import React, { useState } from 'react';
import { COLORS } from "./Globalvariable";

// ============================================================
// 可視化メニュー（FundamentalVisualize.jsx）配下の各フォームで共通利用する
// 見た目パーツ集。ここを直せば10個のフォーム全部の見た目が揃って変わる。
// ============================================================

// カテゴリタブの中に並ぶ「カード」。タイトル・バッジ（カテゴリ名）・説明文の
// ヘッダーを付け、既存の処理フォーム（children）をそのまま中に描画する。
export function VisualizeCard({ title, badge, description, children, guideline }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        padding: 20,
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text }}>{title}</h3>
            {/* ★ガイドラインへのリンク */}
            {guideline && (
              <a
                href={`${window.location.origin}/docs/guideline.html${guideline}`}
                target="_blank"
                rel="noopener noreferrer"
                title="ガイドラインを表示"
                style={{
                  fontSize: "16px",
                  color: "#ff9800",
                  textDecoration: "none",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                ❓
              </a>
            )}
          </div>
        </div>
        {badge && (
          <span
            style={{
              flexShrink: 0,
              background: COLORS.orangeSoft,
              color: COLORS.orange,
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p style={{ margin: '6px 0 16px', fontSize: 12.5, color: COLORS.subtext, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

// フィールドの見出し（必須項目には赤いアスタリスクを付ける）
export function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: '#D64545', marginLeft: 3 }}>*</span>}
    </label>
  );
}

// ファイル選択欄。
// <input type="file">はブラウザごとに見た目がバラバラで直接スタイルできないため、
// 本体は非表示にし、代わりに「📎 ファイルを選択」ボタン＋選択済みファイル名の表示で見た目を揃える。
// inputRef はフォーム側の既存ロジック（file.current.files を読む処理）をそのまま使えるよう、
// 呼び出し側で用意した useRef をそのまま渡してもらう。
export function FileField({ label, required, hint, inputRef, accept, multiple, onChange }) {
  const [fileNames, setFileNames] = useState('');

  const handleChange = (e) => {
    const files = inputRef.current?.files;
    setFileNames(files && files.length ? Array.from(files).map((f) => f.name).join(', ') : '');
    if (onChange) onChange(e);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fff',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12.5,
            color: COLORS.text,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          📎 ファイルを選択
        </button>
        <span style={{ fontSize: 12, color: COLORS.subtext, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileNames || 'ファイルが選択されていません'}
        </span>
      </div>
      {hint && <p style={{ margin: '4px 0 0', fontSize: 11, color: COLORS.subtext }}>{hint}</p>}
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

// 通常のテキスト入力欄（市町村名・メッシュ単位など）
// inline=trueの場合、ラベルとテキストボックスを縦積みではなく横並びにする。
export function TextField({ label, inputRef, defaultValue, placeholder, readOnly, size, type = 'text', inline }) {
  const input = (
    <input
      type={type}
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        // ★sizeが指定されている時はその文字数分の幅に固定する（以前はinline時にflex:1が
        // 常に勝ってしまい、sizeを渡しても無視されて横幅いっぱいに広がるバグがあった）。
        width: size ? `${size}ch` : (inline ? undefined : '100%'),
        flex: inline && !size ? 1 : undefined,
        minWidth: inline ? 0 : undefined,
        boxSizing: 'border-box',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: '8px 10px',
        fontSize: 13,
        color: COLORS.text,
        background: readOnly ? '#F9FAFB' : '#fff',
      }}
    />
  );

  if (inline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {label && (
          <label style={{ flexShrink: 0, minWidth: 170, fontSize: 13, fontWeight: 600, color: COLORS.text }}>
            {label}
          </label>
        )}
        {input}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {input}
    </div>
  );
}

// 選択式(select)欄。既存フォームのref/onChangeロジックはそのまま使う。
// inline=trueの場合、ラベルとセレクトボックスを縦積みではなく横並びにする。
export function SelectField({ label, selectRef, value, onChange, children, inline }) {
  const select = (
    <select
      ref={selectRef}
      value={value}
      onChange={onChange}
      style={{
        width: inline ? undefined : '100%',
        flex: inline ? 1 : undefined,
        minWidth: inline ? 0 : undefined,
        boxSizing: 'border-box',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: '8px 10px',
        fontSize: 13,
        color: COLORS.text,
        background: '#fff',
      }}
    >
      {children}
    </select>
  );

  if (inline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {label && (
          <label style={{ flexShrink: 0, minWidth: 170, fontSize: 13, fontWeight: 600, color: COLORS.text }}>
            {label}
          </label>
        )}
        {select}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {select}
    </div>
  );
}

// オレンジの実行ボタン（アップロード／算出など）。type="submit"のままフォームsubmitを維持する。
export function PrimaryButton({ children, style, ...props }) {
  return (
    <button
      type="submit"
      {...props}
      style={{
        background: COLORS.orange,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '10px 20px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
