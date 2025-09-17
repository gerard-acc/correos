import { useMemo } from "react";
import type { ColumnStructure, DataStructure, RowStructure } from "../../interfaces";
import { getISOWeek, parse, format } from "date-fns";
import { es } from "date-fns/locale";

interface TableTimelines {
  data: DataStructure;
  subcolumnsStructure?: { [key: string]: number };
  rows: RowStructure[];
  columns: ColumnStructure[];
}
// ---------- Types ----------
type MonthHeaderSpan = { key: string; title: string; columnCount: number };
type WeekHeaderSpan = {
  week: number;
  columnCount: number;
  workdayCount: number;
};

// ---------- Helpers ----------
function isMonthlyTotalColumn(col: ColumnStructure): boolean {
  return Boolean(col.isMonthlyTotal);
}

function getSubcolumnSpanMultiplier(
  subcolumnsStructure?: { [key: string]: number },
): number {
  if (!subcolumnsStructure) return 1;
  return Object.keys(subcolumnsStructure).length + 1; // +1 for the Total subcolumn
}

function formatMonthTitle(date: Date): string {
  return format(date, "MMMM", { locale: es });
}

function buildMonthHeaderSpans(columns: ColumnStructure[]): MonthHeaderSpan[] {
  const orderedKeys: string[] = [];
  const spans = new Map<string, MonthHeaderSpan>();
  let lastMonthKey: string | null = null;

  for (const col of columns) {
    if (isMonthlyTotalColumn(col)) {
      if (lastMonthKey && spans.has(lastMonthKey)) {
        spans.get(lastMonthKey)!.columnCount += 1; // include monthly total
      }
      continue;
    }
    const date = parse(col.key, "dd/MM/yyyy", new Date());
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${month}/${year}`;
    lastMonthKey = key;
    if (!spans.has(key)) {
      spans.set(key, {
        key,
        title: formatMonthTitle(new Date(year, month - 1, 1)),
        columnCount: 0,
      });
      orderedKeys.push(key);
    }
    spans.get(key)!.columnCount += 1;
  }

  return orderedKeys.map((k) => spans.get(k)!);
}

function buildWeekHeaderSpans(columns: ColumnStructure[]): WeekHeaderSpan[] {
  const orderedWeeks: number[] = [];
  const spans = new Map<number, WeekHeaderSpan>();
  let lastWeek: number | null = null;

  for (const col of columns) {
    if (isMonthlyTotalColumn(col)) {
      if (lastWeek != null && spans.has(lastWeek)) {
        spans.get(lastWeek)!.columnCount += 1; // include monthly total in last seen week
      }
      continue;
    }
    const date = parse(col.key, "dd/MM/yyyy", new Date());
    const week = getISOWeek(date);
    lastWeek = week;
    if (!spans.has(week)) {
      spans.set(week, { week, columnCount: 0, workdayCount: 0 });
      orderedWeeks.push(week);
    }
    const current = spans.get(week)!;
    current.columnCount += 1;
    if (!col.isFestivity) current.workdayCount += 1;
  }

  return orderedWeeks.map((w) => spans.get(w)!);
}

export default function TableTimelines({
  subcolumnsStructure,
  columns,
}: TableTimelines) {
  const monthSpans = useMemo(() => buildMonthHeaderSpans(columns), [columns]);
  const weekSpans = useMemo(() => buildWeekHeaderSpans(columns), [columns]);
  const spanMultiplier = useMemo(
    () => getSubcolumnSpanMultiplier(subcolumnsStructure),
    [subcolumnsStructure],
  );

  return (
    <>
      <tr className="monthRow">
        <td></td>
        {monthSpans.map((m) => (
          <td key={m.key} colSpan={m.columnCount * spanMultiplier}>
            {m.title}
          </td>
        ))}
      </tr>
      <tr className="weekRow">
        <td></td>
        {weekSpans.map((w) => (
          <td key={`week-${w.week}`} colSpan={w.columnCount * spanMultiplier}>
            <span className="headerPill headerPill--noFill">S{w.week}</span>
            <span className="headerPill">
              Días laborables: {w.workdayCount}
            </span>
          </td>
        ))}
      </tr>
    </>
  );
}
