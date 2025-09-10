import { Fragment } from "react";
import type { RowStructure } from "../../interfaces";
import { sumSubcolumnForDays } from "../../utils";

interface WeeklySubcolumnsGroupProps {
  week: number;
  days: string[];
  row: RowStructure;
  allRows: RowStructure[];
  subKeys: string[];
}

export default function WeeklySubcolumnsGroup({
  week,
  days,
  row,
  allRows,
  subKeys,
}: WeeklySubcolumnsGroupProps) {
  const values = subKeys.map((subKey) =>
    sumSubcolumnForDays(days, row, allRows, subKey),
  );
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
