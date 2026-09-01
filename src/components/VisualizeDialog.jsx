import { useRef } from "react";
import SpatialImpact from './SpatialImpact'
import Chronogical_impact from './ChronogicalImpact'
import Visualization from"./visualization.png";
import LosVisualize from "./LosVisualize";
import FundamentalVisualize from "./FundamentalVisualize";
import Liptrender from './LiptRender';

export const VisualizeDialog = () => {
  const [activeTab, setActiveTab] = useState("current");
  const dialogRef = useRef();
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
  return (
    <>
      <button type="button" onClick={handleShowModal}>
        <img src={Visualization} style={{width:"100%",height:"100%"}}/>
      </button>
      <dialog ref={dialogRef}>
        setActiveTab("LOS")
        {activeTab === "Los" && <LosVisualize/>}
        {activeTab === "Fundamental" && <FundamentalVisualize/>}
        <Spatial_impact/>
    
        <Chronogical_impact/>
        <Liptrender/>
        <button type="button" onClick={handleCloseModal}>
          Close Modal
        </button>
      </dialog>
    </>
  );
};
export default VisualizeDialog;