import React, {useState} from "react"
import "./indputDate.css";

interface InputDateProps {
  label: string;
  onChange?: (date: string) => void;
}

const InputDate = ({ label, onChange }: InputDateProps) => {
  const [date, setDate] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate)
    if (onChange) onChange(newDate)
  }

  return (
    <div className="dateRange__field">
        <label className="dateRange__label">{label}</label>
        <input
          lang="es-ES"
          type="date"
          min={today}
          aria-label={label}
          value={date}
          onChange={handleChange}
          className="dateRange__input"
          placeholder="dd/mm/aa"
        />
    </div>
    // <label className="dateInput">
    //   <span>{label}</span>
    //   <span className="dateInputIcon" aria-hidden="true" />
    //   <input
    //       type="date"
    //       value={date}
    //       onChange={handleChange}
    //       min={today}
    //       aria-label={label}
    //       placeholder="holaaa"
    //       lang="es-ES"
    //   />
    // </label>
  );
}

export default InputDate
