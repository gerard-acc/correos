import type { RowStructure } from "../../interfaces";

interface WeeklyTotalCellProps {
  week: number;
  days: string[];
  row: RowStructure;
  childRows: RowStructure[];
}

function sumObjectValues(obj: { [k: string]: number } | undefined): number {
  if (!obj) return 0;
  return Object.values(obj).reduce((s, n) => s + (n || 0), 0);
}

function computeChildTotalForWeek(row: RowStructure, days: string[]): number {
  let total = 0;
  days.forEach((d) => {
    const v = row.rowData?.[d];
    if (typeof v === "number") total += v;
    else if (typeof v === "object") total += sumObjectValues(v);
  });
  return total;
}

function computeParentTotalForWeek(
  row: RowStructure,
  childRows: RowStructure[],
  days: string[],
): number {
  let total = 0;
  days.forEach((d) => {
    const override = row.customValues?.[d];
    if (typeof override === "number") {
      total += override;
    } else {
      let dayTotal = 0;
      childRows.forEach((child) => {
        const v = child.rowData?.[d];
        if (typeof v === "number") dayTotal += v;
        else if (typeof v === "object") dayTotal += sumObjectValues(v);
      });
      total += dayTotal;
    }
  });
  return total;
}

export default function WeeklyTotalCell({
  week,
  days,
  row,
  childRows,
}: WeeklyTotalCellProps) {
  const total =
    row.type === "child"
      ? computeChildTotalForWeek(row, days)
      : computeParentTotalForWeek(row, childRows, days);
  return <td key={`week-${week}`}>{total}</td>;
}
