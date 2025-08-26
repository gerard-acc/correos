import "./button.css";
import type { MouseEventHandler } from "react";

export default function Button({
  text,
  onClick,
  filled = false,
}: {
  text: string;
  onClick: MouseEventHandler;
  filled?: boolean;
}) {
  return (
    <button
      className={filled ? "button button__filled" : "button"}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
