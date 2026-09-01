import React from 'react'

export default function FileValidated() {
  return (
    <div className='box'>
        <span><b>可視化形式に変換(拡張子「.geojson」→「.json」)</b></span>
    <form action="" method="POST" encType="multipart/form-data" onSubmit={(e) => {
        e.preventDefault(); // リロード防止
        }}>
        <input type="file" webkitdirectory="" name="file" id="fileInput"/>
        <input type="submit" value="変換"/>
    </form>
    </div>
  )
}
