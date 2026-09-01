import { useRef } from "react";
import RenderPoint from "./RenderPoint";
import RenderRoute from './RenderRoute';
import MakeMesh from './MakeMesh';
import job_3d_cad_designer from"./job_3d_cad_designer.png";
import {useEditStore} from "./useStore";
import Chronogical_impact from './ChronogicalImpact'

export const EditFunction = () => {
  const edit = useEditStore(state => state.edit);
  const setEdit = useEditStore(state => state.setEdit);
  const drawline1Ref=useRef(null);
  const drawlineRef=useRef(null);
  const drawlinef=()=>{
    setEdit();
    console.log(edit);
    edit===false?drawlineRef.current.textContent="路線描画不可":drawlineRef.current.textContent="路線描画可能";

  }
  const dialogRef = useRef();
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
  return (
    <>
      <button type="button" onClick={handleShowModal}>
        <img src={job_3d_cad_designer} style={{width:"100%",height:"100%"}}/>
      </button>
      <dialog ref={dialogRef}>
        <button ref={drawlineRef} onClick={drawlinef}>編集可能</button>
        <br></br>
        <button type="button" onClick={handleCloseModal}>
          Close Modal
        </button>
      </dialog>
    </>
  );
};
export default EditFunction;