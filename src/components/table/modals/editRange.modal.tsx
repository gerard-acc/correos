import "./editRange.css";
import { useEffect, useState } from "react";
import { Modal } from "../../layout/modal/Modal";
import Button from "../../common/button/Button";
import Selector from "../../common/selector/Selector";
import { useSpecificModal } from "../../../store/modalStore";

import dataFromBackend from "../../../dataFromBackend.json";
import InputDate from "../../common/inputDate/inputDate";
const { clientsFromBackend } = dataFromBackend

type AdjustmentType = "increment" | "decrement";


const formatDateForDisplay = (value: string) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

export default function EditRangeModal() {
  const editRangeModal = useSpecificModal("edit-range");
  const { close, data, isOpen } = editRangeModal;

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | null>(null);
  const [percentage, setPercentage] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedClient(null);
    setAdjustmentType(null);
    setPercentage("");
    setStartDate("");
    setEndDate("");
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

  }, [isOpen]);

  const handleCancel = () => {
    resetForm();
    close();
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClient(clientId);
    if (error) {
      setError(null);
    }
  };

  const handleAdjustmentChange = (type: AdjustmentType) => {
    setAdjustmentType(type);
    if (error) {
      setError(null);
    }
  };

  const handlePercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const percentageValue = event.target.value

    if(Number(percentageValue) > 100) {
      setError("el porcentaje no puede superar el 100%")
    }

    setPercentage(percentageValue);
  
      if (error) {
      setError(null);
    }
  };

    const handleStartDateChange = (e: string) => {
    const newStartDate = e;
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e: string) => {
    const newEndDate = e;
    setEndDate(newEndDate);

  };

  const handleSave = () => {
    const parsedPercentage = Number(percentage);
    const isValidPercentage = !Number.isNaN(parsedPercentage) && percentage.trim() !== "";
    if(parsedPercentage > 100) {
      setError("el porcentaje no puede superar el 100%")
      return
    }

    if (!selectedClient || !adjustmentType || !isValidPercentage || !startDate || !endDate) {
      setError("Completa todos los campos antes de guardar.");
      return;
    }

    const payloadToSave = {
      clientId: selectedClient,
      adjustmentType,
      percentage: parsedPercentage,
      startDate,
      endDate,
    };

    console.log("handleSave", payloadToSave);
    console.log({data});

    resetForm();
    close();
  };

  return (
    <Modal
      id="edit-range"
      title="Editar por % en un rango de tiempo"
      footer={
        <>
          <Button text="Cancelar" border={false} onClick={handleCancel}></Button>
          <Button text="Guardar" filled={true} onClick={handleSave}></Button>
        </>
      }
    >
      <div className="editRangeContent">
        <Selector
          placeholder="Cliente"
          options={clientsFromBackend}
          type="rounded"
          selectedOption={selectedClient ?? undefined}
          onChange={handleSelectClient}
        />

        <div className="fieldGroup fieldGroup--inline">
          <div className="field">
            <p className="fieldLabel">Tipo de ajuste</p>
            <div className="adjustmentOptions">
              <label className="adjustmentOption">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="increment"
                  checked={adjustmentType === "increment"}
                  onChange={() => handleAdjustmentChange("increment")}
                />
                <span>Incremento</span>
              </label>
              <label className="adjustmentOption">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="decrement"
                  checked={adjustmentType === "decrement"}
                  onChange={() => handleAdjustmentChange("decrement")}
                />
                <span>Decremento</span>
              </label>
            </div>
          </div>
          <div className="field field--percentage">
            <p className="fieldLabel">% ajuste</p>
            <div className="percentageInput">
              <input
                type="number"
                max="100"
                min="0"
                value={percentage}
                onChange={handlePercentageChange}
                placeholder="0"
              />
              <span className="percentageSuffix">%</span>
            </div>
          </div>
        </div>

        <div className="field">
          <p className="fieldLabel">Periodo</p>
          <div className="periodInputs">
            {/* <label className="dateInput">
              <span
                className={`dateInputValue${startDate ? " dateInputValue--filled" : ""}`}
              >
                {startDate ? formatDateForDisplay(startDate) : "Fecha desde"}
              </span>
              <span className="dateInputIcon" aria-hidden="true" />
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                aria-label="Fecha desde"
              />
            </label> */}
            {/* <label className="dateInput">
              <span className={`dateInputValue${endDate ? " dateInputValue--filled" : ""}`}>
                {endDate ? formatDateForDisplay(endDate) : "Fecha hasta"}
              </span>
              <span className="dateInputIcon" aria-hidden="true" />
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                aria-label="Fecha hasta"
              />
            </label> */}
            <InputDate 
              label="Desde"
              onChange={handleStartDateChange}
            />
            <InputDate 
              label="Hasta"
              onChange={handleEndDateChange}
            />
          </div>
        </div>

        {error ? <div className="formError">{error}</div> : null}
      </div>
    </Modal>
  );
}