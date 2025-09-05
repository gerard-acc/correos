import { Fragment } from "react";
import type { RowStructure } from "./interfaces";

interface WeeklySubcolumnsGroupProps {
  week: number;
  days: string[];
  row: RowStructure;
  childRows: RowStructure[];
  subKeys: string[];
}

function computeChildSubcolumnForWeek(
  row: RowStructure,
  days: string[],
  subKey: string,
): number {
  let sum = 0;
  days.forEach((d) => {
    const v = row.rowData?.[d];
    if (typeof v === "object" && v[subKey] !== undefined) sum += v[subKey];
  });
  return sum;
}

function computeParentSubcolumnForWeek(
  row: RowStructure,
  childRows: RowStructure[],
  days: string[],
  subKey: string,
): number {
  let sum = 0;
  days.forEach((d) => {
    const override = row.customValues?.[d];
    if (override && typeof override === "object" && override[subKey] !== undefined) {
      sum += override[subKey];
    } else {
      childRows.forEach((child) => {
        const v = child.rowData?.[d];
        if (typeof v === "object" && v[subKey] !== undefined) sum += v[subKey];
      });
    }
  });
  return sum;
}

export default function WeeklySubcolumnsGroup({
  week,
  days,
  row,
  childRows,
  subKeys,
}: WeeklySubcolumnsGroupProps) {
  const values = subKeys.map((subKey) => {
    return row.type === "child"
      ? computeChildSubcolumnForWeek(row, days, subKey)
      : computeParentSubcolumnForWeek(row, childRows, days, subKey);
  });
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <Fragment key={`week-${week}`}>
      {values.map((v, i) => (
        <td key={`week-${week}-sub-${subKeys[i]}`}>{v}</td>
      ))}
      <td key={`week-${week}-total`}>{total}</td>
    </Fragment>
  );
}

