import type { RowStructure, SubColumn } from "./interfaces";
import { getCalculatedSubcolumnNumber } from "./utils";

interface TableTotalCellProps {
  day: string;
  overrideForDay?: SubColumn;
  baseSubcolumnsForDay?: SubColumn;
  childrenRows?: RowStructure[];
  allRows?: RowStructure[];
  row?: RowStructure;
  subKeys?: string[];
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
  allRows,
  row,
  subKeys,
}: TableTotalCellProps) {
  // If we have context, compute the total by summing effective subcolumn values
  if (allRows && row && subKeys && subKeys.length > 0) {
    // Child rows: sum their own subcolumns for the day
    if (row.type === "child") {
      const v = row.rowData?.[day] as SubColumn | number | undefined;
      let total = 0;
      if (typeof v === "number") total = v;
      else if (typeof v === "object" && v) {
        total = subKeys.reduce((acc, k) => acc + (v[k] || 0), 0);
      }
      return <td>{total}</td>;
    }

    // Parent rows: use effective subcolumn values including direct child-parent overrides
    const total = subKeys.reduce(
      (acc, k) => acc + getCalculatedSubcolumnNumber(day, row, allRows, k),
      0,
    );
    return <td>{total}</td>;
  }
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
