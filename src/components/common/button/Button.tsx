import "./button.css";
import type { MouseEventHandler } from "react";

export default function Button({
  text,
  onClick,
  filled = false,
  border = true,
  icon,
}: {
  text: string;
  onClick: MouseEventHandler;
  filled?: boolean;
  border?: boolean;
  icon?: string;
}) {
  const classNames = ["button"];
  if (filled) classNames.push("button__filled");
  if (!border) classNames.push("button__noborder");
  const className = classNames.join(" ");

  return (
    <button className={className} onClick={onClick}>
      {icon ? <img src={icon}></img> : null}
      {text}
    </button>
  );
}
