import { useEffect, useState } from "react";
import type {
  ColumnStructure,
  DataStructure,
  MonthStructure,
  RowStructure,
  WeekStructure,
} from "./interfaces";
import { buildMonths, buildWeeks } from "./utils";
import { getISOWeek, parse } from "date-fns";

interface TableTimelines {
  data: DataStructure;
  subcolumnsStructure?: { [key: string]: number };
  nestedRows: RowStructure[];
  columns: ColumnStructure[];
}
export default function TableTimelines({
  data,
  subcolumnsStructure,
  nestedRows,
  columns,
}: TableTimelines) {
  const [weeksRow, setWeeksRow] = useState<WeekStructure>({});
  const [monthsRow, setMonthsRow] = useState<MonthStructure>({});

  useEffect(() => {
    setWeeksRow(buildWeeks(data));
    setMonthsRow(buildMonths(data));
  }, [data, nestedRows]);

  const getWeekWordays = (week: string, columns: ColumnStructure[]) => {
    const weekNum = parseInt(week);

    let totalWorkdays = 0;

    for (const column of columns) {
      const date = parse(column.day, "dd/MM/yyyy", new Date());
      const keyWeek = getISOWeek(date);

      if (keyWeek === weekNum && !column.isFestivity) {
        totalWorkdays++;
      }
    }

    return totalWorkdays;
  };

  const getWeekTotal = (week: string, allRows: RowStructure[]) => {
    const weekNum = parseInt(week);

    let totalSum = 0;
    for (const row of allRows) {
      if (row.level !== 0) continue; // only top-level parents

      let rowSum = 0;
      for (const col of columns) {
        const date = parse(col.day, "dd/MM/yyyy", new Date());
        const keyWeek = getISOWeek(date);
        if (keyWeek !== weekNum) continue;

        // Aggregate children's values for this parent and day
        const childRows = allRows.filter(
          (r) => r.type === "child" && r.parentKey && row.key && r.parentKey.startsWith(row.key),
        );
        let numberTotal = 0;
        const subTotals: { [k: string]: number } = {};
        for (const child of childRows) {
          const value = child.rowData?.[col.day];
          if (typeof value === "number") numberTotal += value;
          else if (typeof value === "object") {
            for (const [k, v] of Object.entries(value)) {
              subTotals[k] = (subTotals[k] || 0) + (v as number);
            }
          }
        }

        const override = row.customValues?.[col.day];
        if (override !== undefined) {
          if (typeof override === "number") {
            rowSum += override; // full override
          } else if (typeof override === "object") {
            // Merge override per subcolumn with children's totals
            const merged = { ...subTotals } as { [k: string]: number };
            for (const [k, v] of Object.entries(override)) {
              merged[k] = v as number;
            }
            rowSum += Object.values(merged).reduce((s, v) => s + v, 0);
          }
        } else {
          // No override: use children's totals (object vs number)
          rowSum +=
            Object.keys(subTotals).length > 0
              ? Object.values(subTotals).reduce((s, v) => s + v, 0)
              : numberTotal;
        }
      }
      totalSum += rowSum;
    }

    return totalSum;
  };

  const getMonthTotal = (month: string, allRows: RowStructure[]) => {
    const monthNum = parseInt(month.split("/")[0]);
    const year = parseInt(month.split("/")[1]);

    let totalSum = 0;
    for (const row of allRows) {
      if (row.level !== 0) continue; // only top-level parents

      let rowSum = 0;
      for (const col of columns) {
        const parts = col.day.split("/");
        const keyMonth = parseInt(parts[1]);
        const keyYear = parseInt(parts[2]);
        if (keyMonth !== monthNum || keyYear !== year) continue;

        // Aggregate children's values for this parent and day
        const childRows = allRows.filter(
          (r) => r.type === "child" && r.parentKey && row.key && r.parentKey.startsWith(row.key),
        );
        let numberTotal = 0;
        const subTotals: { [k: string]: number } = {};
        for (const child of childRows) {
          const value = child.rowData?.[col.day];
          if (typeof value === "number") numberTotal += value;
          else if (typeof value === "object") {
            for (const [k, v] of Object.entries(value)) {
              subTotals[k] = (subTotals[k] || 0) + (v as number);
            }
          }
        }

        const override = row.customValues?.[col.day];
        if (override !== undefined) {
          if (typeof override === "number") {
            rowSum += override; // full override
          } else if (typeof override === "object") {
            const merged = { ...subTotals } as { [k: string]: number };
            for (const [k, v] of Object.entries(override)) {
              merged[k] = v as number;
            }
            rowSum += Object.values(merged).reduce((s, v) => s + v, 0);
          }
        } else {
          rowSum +=
            Object.keys(subTotals).length > 0
              ? Object.values(subTotals).reduce((s, v) => s + v, 0)
              : numberTotal;
        }
      }
      totalSum += rowSum;
    }

    return totalSum;
  };

  return (
    <>
      <tr className="monthRow">
        <td></td>
        {Object.keys(monthsRow).map((month) => {
          const current = monthsRow[month];
          return (
            // Expandimos la columna la cantidad de subcolumnas + 1 por la columna Total que se añade siempre
            <td
              colSpan={
                subcolumnsStructure
                  ? current.days * (Object.keys(subcolumnsStructure).length + 1)
                  : current.days
              }
              key={month}
            >
              {current.monthName} {current.year} Total:{" "}
              {getMonthTotal(month, nestedRows)}
            </td>
          );
        })}
      </tr>
      <tr className="workdaysRow">
        <td></td>
        {Object.keys(weeksRow).map((week) => {
          const current = weeksRow[parseInt(week)];
          return (
            // Expandimos la columna la cantidad de subcolumnas + 1 por la columna Total que se añade siempre
            <td
              colSpan={
                subcolumnsStructure
                  ? current.days * (Object.keys(subcolumnsStructure).length + 1)
                  : current.days
              }
              key={week}
            >
              Días laborables: {getWeekWordays(week, columns)}
            </td>
          );
        })}
      </tr>
      <tr className="weekRow">
        <td></td>
        {Object.keys(weeksRow).map((week) => {
          const current = weeksRow[parseInt(week)];
          return (
            // Expandimos la columna la cantidad de subcolumnas + 1 por la columna Total que se añade siempre
            <td
              colSpan={
                subcolumnsStructure
                  ? current.days * (Object.keys(subcolumnsStructure).length + 1)
                  : current.days
              }
              key={week}
            >
              Semana {week} Total: {getWeekTotal(week, nestedRows)}
            </td>
          );
        })}
      </tr>
    </>
  );
}
