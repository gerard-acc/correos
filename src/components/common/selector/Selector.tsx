import arrow_down from "/arrow_down.svg";
import "./selector.css";
import { useState, useEffect, useRef } from "react";

interface Option {
  id: string;
  label: string;
}

type Type = "basic" | "rounded";

interface SelectorProps {
  placeholder: string;
  options: Option[];
  selectedOption?: string;
  type?: Type;
  onChange?: (optionId: string) => void;
}

export default function Selector({
  placeholder,
  options,
  selectedOption,
  type = "basic",
  onChange,
}: SelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedOption);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(selectedOption);
  }, [selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  const toggleSelector = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (option: Option) => {
    setSelected(option.id);
    setIsOpen(false);
    onChange?.(option.id);
  };

  const selectedLabel = options.find((o) => o.id === selected)?.label;

  return (
    <div className="selector" ref={selectorRef}>
      <button
        onClick={toggleSelector}
        className={`selector__button ${type === "rounded" ? "selector__button--rounded" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        type="button"
      >
        <span className="selector_span">{selectedLabel || placeholder}</span>
        <img src={arrow_down} alt="Toggle dropdown" />
      </button>
      {isOpen && (
        <div className="selector__options" role="listbox">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => selectOption(option)}
              role="option"
              aria-selected={selected === option.id}
              className="selector__options__option"
            >
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
