import type { ColumnStructure, RowStructure } from "../../interfaces";
import { getMonthDayKeysForTotalColumn, sumAggregatedForDays } from "../../utils";

interface MonthlyTotalCellProps {
  columns: ColumnStructure[];
  totalColumnIndex: number;
  row: RowStructure;
  allRows: RowStructure[];
  cellKey?: string;
}

export default function MonthlyTotalCell({
  columns,
  totalColumnIndex,
  row,
  allRows,
  cellKey,
}: MonthlyTotalCellProps) {
  const monthDays = getMonthDayKeysForTotalColumn(columns, totalColumnIndex);
  const total = sumAggregatedForDays(monthDays, row, allRows);

  return <td key={cellKey}>{total}</td>;
}
