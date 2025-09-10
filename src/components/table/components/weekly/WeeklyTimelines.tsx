import { useMemo } from "react";
import type { ColumnStructure, RowStructure } from "../../interfaces";
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";
import { countWorkdaysForDays, sumAggregatedForDays } from "../../utils";

interface WeeklyTimelinesProps {
  weeksMap: { [week: number]: string[] };
  weekKeys: number[];
  subcolumnsStructure?: { [key: string]: number };
  rows: RowStructure[];
  columns: ColumnStructure[];
}

export default function WeeklyTimelines({
  weeksMap,
  weekKeys,
  subcolumnsStructure,
  rows,
  columns,
}: WeeklyTimelinesProps) {
  const monthGroups = useMemo(() => {
    const order: string[] = [];
    const map: {
      [key: string]: {
        monthNum: number;
        monthName: string;
        year: number;
        weeks: number;
      };
    } = {};
    weekKeys.forEach((week) => {
      const days = weeksMap[week] || [];
      if (days.length === 0) return;
      const first = days[0];
      const date = parse(first, "dd/MM/yyyy", new Date());
      const monthNum = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${monthNum}/${year}`;
      if (!map[key]) {
        map[key] = {
          monthNum,
          monthName: format(new Date(year, monthNum - 1), "MMMM", {
            locale: es,
          }),
          year,
          weeks: 0,
        };
        order.push(key);
      }
      map[key].weeks += 1;
    });
    return order.map((k) => ({ key: k, ...map[k] }));
  }, [weekKeys, weeksMap]);

  const getWeekWorkdays = (week: number) => {
    const days = weeksMap[week] || [];
    return countWorkdaysForDays(days, columns);
  };

  const getWeekTotalAggregated = (week: number, allRows: RowStructure[]) => {
    const days = weeksMap[week] || [];
    let total = 0;
    for (const row of allRows) {
      if (row.level !== 0) continue; // only top-level parents
      total += sumAggregatedForDays(days, row, allRows);
    }
    return total;
  };

  const getMonthTotalAggregated = (
    monthNum: number,
    year: number,
    allRows: RowStructure[],
  ) => {
    const daysInMonth = columns
      .filter((c) => {
        const [, m, y] = c.day.split("/").map((n) => parseInt(n));
        return m === monthNum && y === year;
      })
      .map((c) => c.day);
    let total = 0;
    for (const row of allRows) {
      if (row.level !== 0) continue; // only top-level parents
      total += sumAggregatedForDays(daysInMonth, row, allRows);
    }
    return total;
  };

  return (
    <>
      <tr className="monthRow">
        <td></td>
        {monthGroups.map((m) => (
          <td
            key={`month-${m.key}`}
            colSpan={
              m.weeks *
              (subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1
                : 1)
            }
          >
            {m.monthName} {m.year} Total:{" "}
            {getMonthTotalAggregated(m.monthNum, m.year, rows)}
          </td>
        ))}
      </tr>
      <tr className="workdaysRow">
        <td></td>
        {weekKeys.map((week) => (
          <td
            key={`workdays-${week}`}
            colSpan={
              subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1
                : 1
            }
          >
            Días laborables: {getWeekWorkdays(week)}
          </td>
        ))}
      </tr>
      <tr className="weekRow">
        <td></td>
        {weekKeys.map((week) => (
          <td
            key={`week-${week}`}
            colSpan={
              subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1
                : 1
            }
          >
            Semana {week} Total: {getWeekTotalAggregated(week, rows)}
          </td>
        ))}
      </tr>
      {subcolumnsStructure && (
        <tr className="subcolumnsRow">
          <td></td>
          {weekKeys.map((week) => (
            <>
              {Object.keys(subcolumnsStructure).map((key) => (
                <td key={`week-${week}-${key}`}>{key}</td>
              ))}
              <td key={`week-${week}-total`}>
                <strong>Total</strong>
              </td>
            </>
          ))}
        </tr>
      )}
    </>
  );
}
