// No imports needed
import type { SubColumn } from "./interfaces";

interface TableTotalCellProps {
  subColumns: SubColumn | undefined;
}

export default function TableTotalCell({ subColumns }: TableTotalCellProps) {
  const total = !subColumns
    ? 0
    : Object.values(subColumns).reduce((acc, val) => acc + val, 0);

  return <td>{total}</td>;
}
