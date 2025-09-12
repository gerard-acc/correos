import type { RowStructure } from "../interfaces";

interface TableFirstCol {
  row: RowStructure;
  expandedParents: Set<string>;
  onToggle: (key: string) => void;
}

export default function TableFirstCol({
  row,
  expandedParents,
  onToggle,
}: TableFirstCol) {
  return (
    <td
      style={{
        paddingLeft: `${(row.level + 1) * 10}px`,
        cursor: row.type === "parent" ? "pointer" : "default",
        borderLeft: `4px solid ${row.status === "allVerified" ? "var(--verified-cell)" : row.status === "uncompletedVerification" ? "var(--uncompleted-row)" : "unset"}`,
      }}
      onClick={
        row.type === "parent" && row.key ? () => onToggle(row.key!) : undefined
      }
    >
      {row.type === "parent" ? (
        row.key && expandedParents.has(row.key) ? (
          <img src="/arrow_down.svg" width="10px" />
        ) : (
          <img src="/arrow_right.svg" width="7px" />
        )
      ) : (
        ""
      )}

      {row.name}
    </td>
  );
}
