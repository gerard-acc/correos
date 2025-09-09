import "./tableFooter.css";
import Button from "../common/button/Button";
import LegendPoint from "../common/legendPoint/LegendPoint";
import { useSpecificModal } from "../../store/modalStore";
import EditRangeModal from "./modals/editRange.modal";
import HistoricChangesModal from "./modals/historicChanges.modal";
import WriteCommentModal from "./modals/writeComment";

export default function TableFooter() {
  const editRangeModal = useSpecificModal("edit-range");
  const historicChangesModal = useSpecificModal("historic-changes");
  const writeCommentModal = useSpecificModal("write-comment");

  return (
    <>
      <div className="tableActions">
        <div className="tableActions__status">
          <p className="smallTitle">Estado</p>
          <div className="tableActions__status__legend">
            <LegendPoint
              text="Revisado"
              color="var(--status-success)"
            ></LegendPoint>
            <LegendPoint
              text="En progreso"
              color="var(--status-warning)"
            ></LegendPoint>
          </div>
        </div>
        <div className="tableActions__buttons">
          <Button
            text="Escribir un comentario"
            onClick={() => {
              writeCommentModal.open();
            }}
          ></Button>
          <Button
            text="Ver histórico de cambios"
            onClick={() => {
              historicChangesModal.open();
            }}
          ></Button>
          <Button
            filled={true}
            text="Editar por % en un rango de tiempo"
            onClick={() => {
              editRangeModal.open();
            }}
          ></Button>
        </div>
      </div>
      <WriteCommentModal></WriteCommentModal>
      <HistoricChangesModal></HistoricChangesModal>
      <EditRangeModal></EditRangeModal>
    </>
  );
}
