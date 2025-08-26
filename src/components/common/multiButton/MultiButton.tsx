import { useState } from "react";
import "./multiButton.css";

interface Button {
  id: string;
  label: string;
}
interface MultiButton {
  buttons: Button[];
  onChange?: (buttonId: string) => void;
}

export default function MultiButton({ buttons, onChange }: MultiButton) {
  const [activeButton, setActiveButton] = useState("");

  return (
    <div className="multiButtons">
      {buttons.map((button) => (
        <>
          <button
            className={`multiButton ${activeButton === button.id ? "active" : ""}`}
            onClick={() => {
              setActiveButton(button.id);
              onChange?.(button.id);
            }}
          >
            {button.label}
          </button>
        </>
      ))}
    </div>
  );
}
