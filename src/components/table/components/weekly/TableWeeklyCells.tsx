import { useMemo } from "react";
import type { RowStructure } from "../../interfaces";
import WeeklySubcolumnsGroup from "./WeeklySubcolumnsGroup";
import WeeklyTotalCell from "./WeeklyTotalCell";

interface TableWeeklyCellsProps {
  row: RowStructure;
  weekKeys: number[];
  weeksMap: { [week: number]: string[] };
  subcolumnsStructure?: { [key: string]: number };
  rows: RowStructure[];
}

// ---------- Main component ----------
export default function TableWeeklyCells({
  row,
  weekKeys,
  weeksMap,
  subcolumnsStructure,
  rows,
}: TableWeeklyCellsProps) {
  const subKeys = useMemo(
    () => Object.keys(subcolumnsStructure || {}),
    [subcolumnsStructure],
  );

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
            allRows={rows}
            subKeys={subKeys}
          />
        ) : (
          <WeeklyTotalCell
            key={`total-${week}`}
            week={week}
            days={days}
            row={row}
            allRows={rows}
          />
        );
      })}
    </>
  );
}
