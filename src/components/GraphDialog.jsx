import { useRef,useMemo } from "react";
import Graphimg from"./graph_woman_serious.png"
import TinyBarChart from "./Barchart";
import AccessibleList from './AccessibilityList';

export const GraphDialog = () => {
  const dialogRef = useRef();
  const handleShowModal = () => dialogRef.current?.show();
  const handleCloseModal = () => dialogRef.current?.close();
  useMemo(() =>Accessiblelist,[]);
  useMemo(() =>TinyBarChart,[]);
  return (
    <>
      <button type="button" onClick={handleShowModal}>
        <img src={Graphimg} style={{width:"100%",height:"100%"}}/>
      </button>
      <dialog ref={dialogRef} open>
        <div className="radar"style={{ width: '20vw', height:"40vh", zIndex: 10 }}>
          <Accessiblelist style={{ width: '80%' }}/>
        </div>
        <div className="bar"style={{ width: '20vw', height:"40vh",zIndex: 10 }}>
          <TinyBarChart style={{ width: '80%' }}/>
        </div>
        
        <button type="button" onClick={handleCloseModal}>
          Close Modal
        </button>
      </dialog>
    </>
  );
};
export default GraphDialog;