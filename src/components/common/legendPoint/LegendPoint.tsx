import "./legendPoint.css";

interface LegendPoint {
  color: string;
  text: string;
}

export default function LegendPoint({ color, text }: LegendPoint) {
  return (
    <div className="legendPoint">
      <div
        className="legendPoint__dot"
        style={{ backgroundColor: color }}
      ></div>
      <p className="smallText legendPoint__text">{text}</p>
    </div>
  );
}
