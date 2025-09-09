import "./editRange.css";
import { Modal } from "../../layout/modal/Modal";
import Button from "../../common/button/Button";
import { useSpecificModal } from "../../../store/modalStore";

export default function HistoricChangesModal() {
  const historicChangesModal = useSpecificModal("historic-changes");

  return (
    <Modal
      id="historic-changes"
      title="Ver histórico de cambios"
      footer={
        <>
          <Button text="Cancelar" onClick={historicChangesModal.close}></Button>
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
      <p>Ver histórico de cambios</p>
    </Modal>
  );
}
