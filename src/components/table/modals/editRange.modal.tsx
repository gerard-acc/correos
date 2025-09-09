import "./editRange.css";
import { Modal } from "../../layout/modal/Modal";
import MultiButton from "../../common/multiButton/MultiButton";
import DateRange from "../../common/dateRange/DateRange";
import Button from "../../common/button/Button";
import { useSpecificModal } from "../../../store/modalStore";
import InputPercentage from "../../common/inputPercentage/inputPercentage";

export default function EditRangeModal() {
  const editRangeModal = useSpecificModal("edit-range");

  return (
    <Modal
      id="edit-range"
      title="Editar por % en un rango de tiempo"
      footer={
        <>
          <Button text="Cancelar" onClick={editRangeModal.close}></Button>
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
      <div className="form">
        <div className="formRow">
          <MultiButton
            buttons={[
              { id: "inc", label: "Incremento" },
              { id: "dec", label: "Decremento" },
            ]}
          ></MultiButton>
          <InputPercentage
            onChange={(value) => console.log(value)}
          ></InputPercentage>
        </div>
        <div>
          <p className="textTitle">Periodo:</p>
          <DateRange
            onDateChange={(start, end) => console.log(start, end)}
          ></DateRange>
        </div>
      </div>
    </Modal>
  );
}
