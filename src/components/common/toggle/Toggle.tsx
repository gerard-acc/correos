import { useState } from "react";
import "./toggle.css";

interface ToggleProps {
  label: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Toggle({
  label,
  defaultChecked = false,
  onChange,
}: ToggleProps) {
  const [isOn, setIsOn] = useState(defaultChecked);

  const handleToggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="toggle-container">
      <span className="toggle-label">{label}</span>
      <div
        className={`toggle-switch ${isOn ? "on" : "off"}`}
        onClick={handleToggle}
      >
        <div className="toggle-knob" />
      </div>
    </div>
  );
}
