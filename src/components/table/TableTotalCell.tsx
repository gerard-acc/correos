// No imports needed
import type { RowStructure, SubColumn } from "./interfaces";

interface TableTotalCellProps {
  day: string;
  isParent: boolean;
  overrideForDay?: SubColumn;
  baseSubcolumnsForDay?: SubColumn;
  childrenRows?: RowStructure[];
}

export default function TableTotalCell({
  day,
  isParent,
  overrideForDay,
  baseSubcolumnsForDay,
  childrenRows,
}: TableTotalCellProps) {
  // Aggregate values. For parent: derive from children; for child: use own base subcolumns.
  const subTotals: Record<string, number> = {};

  if (isParent) {
    const children = childrenRows || [];
    for (const child of children) {
      const val = child.rowData?.[day];
      if (typeof val === "object" && val) {
        for (const [k, v] of Object.entries(val)) {
          subTotals[k] = (subTotals[k] || 0) + (v as number);
        }
      }
    }
  } else if (baseSubcolumnsForDay) {
    for (const [k, v] of Object.entries(baseSubcolumnsForDay)) {
      subTotals[k] = (v as number) ?? 0;
    }
  }

  // Apply overrides as object: replace only specified subcolumns
  if (overrideForDay) {
    for (const [k, v] of Object.entries(overrideForDay)) {
      subTotals[k] = (v as number) ?? 0;
    }
  }

  const total = Object.values(subTotals).reduce((s, v) => s + v, 0);
  return <td>{total}</td>;
}
