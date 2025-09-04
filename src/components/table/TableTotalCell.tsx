// No imports needed
import type { ColumnStructure, RowStructure, SubColumn } from "./interfaces";

interface TableTotalCellProps {
  rowInfo: RowStructure | undefined;
  column: ColumnStructure;
}

export default function TableTotalCell({
  rowInfo,
  column,
}: TableTotalCellProps) {
  const base = (rowInfo?.rowData?.[column.day] || {}) as SubColumn;
  const custom = (rowInfo?.customValues?.[column.day] || {}) as SubColumn;

  const merged = { ...base, ...custom } as SubColumn;
  const total = Object.values(merged).reduce((acc, val) => acc + val, 0);

  return <td>{total}</td>;
}
