import "./writeComment.css";
import { useState, useEffect } from "react";
import { Modal } from "../../layout/modal/Modal";
import Button from "../../common/button/Button";
import { useSpecificModal } from "../../../store/modalStore";
import Selector from "../../common/selector/Selector";

import dataFromBackend from "../../../dataFromBackend.json";
const { weeks } = dataFromBackend


export default function WriteCommentModal() {
  const writeCommentModal = useSpecificModal("write-comment");
  const { close, data, isOpen } = writeCommentModal;


  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
    const [error, setError] = useState<string | null>(null);


  const resetForm = () => {
    setSelectedClient(null)
    setSelectedWeek(null)
    setComment("")
    setError(null);
  }


    useEffect(() => {
      if (!isOpen) {
        resetForm();
        return;
      }
       }, [isOpen]);

  const handleSelectClient = (clientId: string) => {
    setSelectedClient(clientId);
  };

  const handleSelectWeek = (week: string) => {
    setSelectedWeek(week);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isOpen) {
      return;
    }

    setComment(event.target.value);
  };

    const handleClose = () => {
    close();
  };

  const handleSave = () => {
    if(!selectedClient || !selectedWeek || !comment){
      setError("Completa todos los campos antes de guardar.");
      return;
    }
    console.log("handleSave", { selectedClient, selectedWeek, comment });
    console.log({data})
    close();
  };

  return (
    <Modal
      id="write-comment"
      title="Escribir un comentario"
      footer={
        <>
          <Button 
            text="Cancelar" 
            border={false} 
            onClick={handleClose}
            />
          <Button
            text="Guardar"
            filled={true}
            onClick={() => handleSave()}
          />
        </>
      }
    >
      <div className="writeCommentContent">
        <Selector
          placeholder="Cliente"
          options={dataFromBackend.clientsFromBackend}
          type="rounded"
          selectedOption={selectedClient ?? undefined}
          onChange={handleSelectClient}
        />
        <div className="weekSelector">
          <p className="weekSelectorTitle">Selecciona semana</p>
          <div className="weekSelectorGrid">
            {weeks.map((week) => {
              const isSelected = week === selectedWeek;

              return (
                <button
                  key={week}
                  type="button"
                  className={`weekSelectorButton${
                    isSelected ? " weekSelectorButtonSelected" : ""
                  }`}
                  onClick={() => handleSelectWeek(week)}
                >
                  {week}
                </button>
              );
            })}
          </div>
        </div>
        <div className="commentSection">
          <p className="commentLabel">Comentario</p>
          <textarea
            className="commentTextarea"
            placeholder="Introduce aqui tu texto..."
            value={comment}
            onChange={handleCommentChange}
          />
        </div>
         {error ? <div className="formError">{error}</div> : null}
      </div>
    </Modal>
  );
}
