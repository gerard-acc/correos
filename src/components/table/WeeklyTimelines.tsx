import { useMemo } from "react";
import type { ColumnStructure, RowStructure } from "./interfaces";
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";

interface WeeklyTimelinesProps {
  weeksMap: { [week: number]: string[] };
  weekKeys: number[];
  subcolumnsStructure?: { [key: string]: number };
  nestedRows: RowStructure[];
  columns: ColumnStructure[];
}

export default function WeeklyTimelines({
  weeksMap,
  weekKeys,
  subcolumnsStructure,
  nestedRows,
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
    let count = 0;
    days.forEach((d) => {
      const c = columns.find((col) => col.day === d);
      if (c && !c.isFestivity) count += 1;
    });
    return count;
  };

  const getWeekTotalAggregated = (week: number, allRows: RowStructure[]) => {
    const days = weeksMap[week] || [];
    let totalSum = 0;
    for (const row of allRows) {
      if (row.level !== 0) continue; // top-level parents only
      let rowSum = 0;
      const childRows = allRows.filter(
        (r) =>
          r.type === "child" &&
          r.parentKey &&
          row.key &&
          r.parentKey.startsWith(row.key),
      );
      days.forEach((d) => {
        let numberTotal = 0;
        const subTotals: { [k: string]: number } = {};
        for (const child of childRows) {
          const value = child.rowData?.[d];
          if (typeof value === "number") numberTotal += value;
          else if (typeof value === "object") {
            for (const [k, v] of Object.entries(value)) {
              subTotals[k] = (subTotals[k] || 0) + (v as number);
            }
          }
        }

        const override = row.customValues?.[d];
        if (override !== undefined) {
          if (typeof override === "number") {
            rowSum += override;
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
      });
      totalSum += rowSum;
    }
    return totalSum;
  };

  const getMonthTotalAggregated = (
    monthNum: number,
    year: number,
    allRows: RowStructure[],
  ) => {
    let totalSum = 0;
    for (const row of allRows) {
      if (row.level !== 0) continue; // only top-level parents

      let rowSum = 0;
      for (const col of columns) {
        const parts = col.day.split("/");
        const keyMonth = parseInt(parts[1]);
        const keyYear = parseInt(parts[2]);
        if (keyMonth !== monthNum || keyYear !== year) continue;

        const childRows = allRows.filter(
          (r) =>
            r.type === "child" &&
            r.parentKey &&
            row.key &&
            r.parentKey.startsWith(row.key),
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
            rowSum += override;
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
            {getMonthTotalAggregated(m.monthNum, m.year, nestedRows)}
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
            Semana {week} Total: {getWeekTotalAggregated(week, nestedRows)}
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
