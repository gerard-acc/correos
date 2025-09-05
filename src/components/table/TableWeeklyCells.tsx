import { useMemo } from "react";
import type { RowStructure } from "./interfaces";
import WeeklySubcolumnsGroup from "./WeeklySubcolumnsGroup";
import WeeklyTotalCell from "./WeeklyTotalCell";

interface TableWeeklyCellsProps {
  row: RowStructure;
  weekKeys: number[];
  weeksMap: { [week: number]: string[] };
  subcolumnsStructure?: { [key: string]: number };
  nestedRows: RowStructure[];
}

// ---------- Main component ----------
export default function TableWeeklyCells({
  row,
  weekKeys,
  weeksMap,
  subcolumnsStructure,
  nestedRows,
}: TableWeeklyCellsProps) {
  const childRows = useMemo(
    () =>
      row.type === "parent" && row.key
        ? nestedRows.filter(
            (r) => r.type === "child" && r.parentKey && r.parentKey.startsWith(row.key!),
          )
        : [],
    [nestedRows, row],
  );
  const subKeys = useMemo(() => Object.keys(subcolumnsStructure || {}), [subcolumnsStructure]);

  return (
    <>
      {weekKeys.map((week) => {
        const days = weeksMap[week] || [];
        return subcolumnsStructure ? (
          <WeeklySubcolumnsGroup
            key={`group-${week}`}
            week={week}
            days={days}
            row={row}
            childRows={childRows}
            subKeys={subKeys}
          />
        ) : (
          <WeeklyTotalCell
            key={`total-${week}`}
            week={week}
            days={days}
            row={row}
            childRows={childRows}
          />
        );
      })}
    </>
  );
}
