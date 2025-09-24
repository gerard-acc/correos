import "./button.css";
import type { MouseEventHandler } from "react";

export default function Button({
  text,
  onClick,
  filled = false,
  border = true,
  icon,
  style = {}
}: {
  text: string;
  onClick: MouseEventHandler;
  filled?: boolean;
  border?: boolean;
  icon?: string;
  style?: object
}) {
  const classNames = ["button"];
  if (filled) classNames.push("button__filled");
  if (!border) classNames.push("button__noborder");
  const className = classNames.join(" ");

  return (
    <button className={className} onClick={onClick} style={style}>
      {icon ? <img src={icon}></img> : null}
      {text}
    </button>
  );
}
