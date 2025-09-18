import { useState } from "react";
import "./dateRange.css";

interface DateRangeProps {
  onDateChange?: (startDate: string, endDate: string) => void;
}

export default function DateRange({ onDateChange }: DateRangeProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    onDateChange?.(newStartDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    onDateChange?.(startDate, newEndDate);
  };

  return (
    <div className="dateRange">
      <div className="dateRange__field">
        <label className="dateRange__label">Desde</label>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="dateRange__input"
          placeholder="dd/mm/aa"
        />
      </div>
      <div className="dateRange__field">
        <label className="dateRange__label">Hasta</label>
        <input
        lang="es-ES"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="dateRange__input"
          placeholder="dd/mm/aa"
        />
      </div>
    </div>
  );
}
