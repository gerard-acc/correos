import { useEffect, useState } from "react";
import "./multiradius.css";

interface ToggleProps {
  title: string;
  defaultLabel: string;
  labels: { id: string; name: string }[];
  onChange?: (selectedId: string) => void;
}

export default function MultiRadius({
  title,
  labels,
  defaultLabel,
  onChange,
}: ToggleProps) {
  const [checked, setChecked] = useState("");

  useEffect(() => {
    setChecked(defaultLabel);
  }, []);

  return (
    <div className="multiradius">
      <p className="labelText">{title}</p>
      <div className="options">
        {labels.map((label) => (
          <label key={label.id}>
            <p>{label.name}</p>
            <input
              type="radio"
              name={title}
              value={label.id}
              onChange={(e) => {
                setChecked(e.target.value);
                onChange?.(e.target.value);
              }}
              checked={checked === label.id}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
