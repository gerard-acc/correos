interface Check {
  id: string;
  label: string;
}
interface Checks {
  title: string;
  checks: Check[];
  onCheckChange?: (checkId: string, isChecked: boolean) => void;
}

export default function Checks({ title, checks, onCheckChange }: Checks) {
  return (
    <div className="checksContainer">
      <p>{title}</p>
      {checks.map((check) => (
        <>
          <input
            type="checkbox"
            name={check.id}
            id={check.id}
            value={check.id}
            onChange={(e) => onCheckChange?.(check.id, e.target.checked)}
          />
          <label htmlFor={check.id}>{check.label}</label>
        </>
      ))}
    </div>
  );
}
