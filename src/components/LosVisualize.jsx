import { useRef } from 'react';
import SpatialImpact from './SpatialImpact'
import Chronogical_impact from './ChronogicalImpact'
import Visualization from"./visualization.png"

export const LosVisualize = () => {
  const dialogRef = useRef();
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
  return (
    <>
      <button type="button" onClick={handleShowModal}>
        <img src={Visualization} style={{width:"100%",height:"100%"}}/>
      </button>
      <dialog ref={dialogRef}>
        <button type="button" onClick={handleCloseModal}>
          Close Modal
        </button>
      </dialog>
    </>
  );
};
export default LosVisualize;