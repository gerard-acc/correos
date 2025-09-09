import "./inputPercentage.css";

interface InputPercentageProps {
  onChange: (value: number) => void;
}

export default function InputPercentage({ onChange }: InputPercentageProps) {
  return (
    <div className="inputPercentage">
      <input type="number" onChange={() => onChange}></input>
      <span>%</span>
    </div>
  );
}
