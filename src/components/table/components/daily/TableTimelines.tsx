import { useEffect, useState } from "react";
import type {
  ColumnStructure,
  DataStructure,
  MonthStructure,
  RowStructure,
  WeekStructure,
} from "../../interfaces";
import { buildMonths, buildWeeks } from "../../utils";
import { getISOWeek, parse } from "date-fns";

interface TableTimelines {
  data: DataStructure;
  subcolumnsStructure?: { [key: string]: number };
  rows: RowStructure[];
  columns: ColumnStructure[];
}
export default function TableTimelines({
  data,
  subcolumnsStructure,
  rows,
  columns,
}: TableTimelines) {
  const [weeksRow, setWeeksRow] = useState<WeekStructure>({});
  const [monthsRow, setMonthsRow] = useState<MonthStructure>({});

  useEffect(() => {
    setWeeksRow(buildWeeks(data));
    setMonthsRow(buildMonths(data));
  }, [data, rows]);

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
              {current.monthName}
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
              <span className="headerPill headerPill--noFill">S{week}</span>
              <span className="headerPill">
                Días laborables: {getWeekWordays(week, columns)}
              </span>
            </td>
          );
        })}
      </tr>
    </>
  );
}
