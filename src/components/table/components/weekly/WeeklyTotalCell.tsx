import type { RowStructure } from "../../interfaces";
import { sumAggregatedForDays } from "../../utils";

interface WeeklyTotalCellProps {
  week: number;
  days: string[];
  row: RowStructure;
  allRows: RowStructure[];
}

export default function WeeklyTotalCell({
  week,
  days,
  row,
  allRows,
}: WeeklyTotalCellProps) {
  const total = sumAggregatedForDays(days, row, allRows);
  return <td key={`week-${week}`}>{total}</td>;
}
