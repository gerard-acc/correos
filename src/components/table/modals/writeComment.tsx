import "./editRange.css";
import { Modal } from "../../layout/modal/Modal";
import Button from "../../common/button/Button";
import { useSpecificModal } from "../../../store/modalStore";

export default function WriteCommentModal() {
  const writeCommentModal = useSpecificModal("write-comment");

  return (
    <Modal
      id="write-comment"
      title="Escribir un comentario"
      footer={
        <>
          <Button text="Cancelar" onClick={writeCommentModal.close}></Button>
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
      <p>Escribir un comentario</p>
    </Modal>
  );
}
