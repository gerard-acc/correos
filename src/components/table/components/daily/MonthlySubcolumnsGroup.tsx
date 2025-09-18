import { Fragment } from "react";
import type { ColumnStructure, RowStructure } from "../../interfaces";
import { getMonthDayKeysForTotalColumn, sumSubcolumnForDays } from "../../utils";

interface MonthlySubcolumnsGroupProps {
  columns: ColumnStructure[];
  totalColumnIndex: number;
  row: RowStructure;
  allRows: RowStructure[];
  subKeys: string[];
  groupKey?: string;
}

export default function MonthlySubcolumnsGroup({
  columns,
  totalColumnIndex,
  row,
  allRows,
  subKeys,
  groupKey,
}: MonthlySubcolumnsGroupProps) {
  const monthDays = getMonthDayKeysForTotalColumn(columns, totalColumnIndex);
  const values = subKeys.map((subKey) =>
    sumSubcolumnForDays(monthDays, row, allRows, subKey),
  );
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <Fragment key={groupKey}>
      {values.map((v, i) => (
        <td key={`${groupKey}-sub-${subKeys[i]}`}>{v}</td>
      ))}
      <td key={`${groupKey}-total`}>{total}</td>
    </Fragment>
  );
}
