import "./tableFooter.css";
import Button from "../common/button/Button";
import LegendPoint from "../common/legendPoint/LegendPoint";
import { useSpecificModal } from "../../store/modalStore";
import { Modal } from "../layout/modal/Modal";

export default function TableFooter() {
  const deleteModal = useSpecificModal("delete-user");

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
              alert("comentario");
            }}
          ></Button>
          <Button
            text="Ver histórico de cambios"
            onClick={() => {
              alert("histórico");
            }}
          ></Button>
          <Button
            filled={true}
            text="Editar por % en un rango de tiempo"
            onClick={() => {
              deleteModal.open({ userId: "ola" });
            }}
          ></Button>
        </div>
      </div>
      <Modal
        id="delete-user"
        title="Editar por % en un rango de tiempo"
        footer={
          <>
            <Button text="Cancelar" onClick={deleteModal.close}></Button>
            <Button
              text="Guardar"
              filled={true}
              onClick={() => {
                console.log("Saving");
              }}
            ></Button>
          </>
        }
      >
        <p>Modal</p>
      </Modal>
    </>
  );
}
