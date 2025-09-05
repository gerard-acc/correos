import type { RowStructure, SubColumn } from "./interfaces";

interface TableTotalCellProps {
  day: string;
  overrideForDay?: SubColumn;
  baseSubcolumnsForDay?: SubColumn;
  childrenRows?: RowStructure[];
}

// Merge two SubColumn maps by summing numeric values for matching keys
function mergeSubTotals(a: SubColumn, b: SubColumn): SubColumn {
  const result: SubColumn = { ...a };
  for (const [key, val] of Object.entries(b)) {
    const num = typeof val === "number" ? val : 0;
    result[key] = (result[key] ?? 0) + num;
  }
  return result;
}

// Compute aggregated subcolumns for a parent row from its children
function aggregateFromChildren(
  day: string,
  children: RowStructure[],
): SubColumn {
  return children.reduce<SubColumn>((acc, child) => {
    const value = child.rowData?.[day] as SubColumn | undefined;
    return value ? mergeSubTotals(acc, value) : acc;
  }, {} as SubColumn);
}

function sumSubColumns(subcolumns: SubColumn): number {
  return Object.values(subcolumns).reduce((sum, v) => sum + (v ?? 0), 0);
}

export default function TableTotalCell({
  day,
  overrideForDay,
  baseSubcolumnsForDay,
  childrenRows,
}: TableTotalCellProps) {
  const baseTotals: SubColumn =
    childrenRows && childrenRows.length > 0
      ? aggregateFromChildren(day, childrenRows)
      : baseSubcolumnsForDay
        ? { ...baseSubcolumnsForDay }
        : {};

  // Apply overrides by replacing only the provided subcolumn keys
  const overriddenTotals: SubColumn = overrideForDay
    ? { ...baseTotals, ...overrideForDay }
    : baseTotals;

  // Sum to a single total number
  const total = sumSubColumns(overriddenTotals);

  return <td>{total}</td>;
}
