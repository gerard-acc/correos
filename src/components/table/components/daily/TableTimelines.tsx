import { useMemo } from "react";
import type { ColumnStructure } from "../../interfaces";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TableTimelines {
  columns: ColumnStructure[];
  subcolumnsStructure?: { [key: string]: number };
}

const MonthPill = ({ dayKey }: { dayKey: string }) => {
  // dayKey is dd/MM/yyyy; extract MM and yyyy
  const [, monthStr, yearStr] = dayKey.split("/");
  const monthNum = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);
  const monthName = format(new Date(year, monthNum - 1), "MMMM", {
    locale: es,
  });
  return <span className="headerPill headerPill--noFill">{monthName}</span>;
};

const WeekPill = ({
  week,
  festivities,
}: {
  week: number;
  festivities: number;
}) => {
  return (
    <>
      <span className="headerPill headerPill--noFill">S{week}</span>
      <span className="headerPill">Días festivos: {week && festivities}</span>
    </>
  );
};

export default function TableTimelines({
  columns,
  subcolumnsStructure,
}: TableTimelines) {
  const weeksFestivitiesCount = useMemo(() => {
    const weeksFestivities: { [key: number]: number } = {};
    columns.forEach((column) => {
      if (!column.week) return;
      if (!weeksFestivities[column.week]) weeksFestivities[column.week] = 0;

      if (column.isFestivity) weeksFestivities[column.week]++;
    });
    return weeksFestivities;
  }, [columns]);

  return (
    <>
      <tr className="timelineRow">
        <td></td>
        {columns.map((column, index) => {
          const colSpan = subcolumnsStructure
            ? Object.keys(subcolumnsStructure).length + 1
            : 1;
          // Si es el inicio de la tabla, o si coincide que es primero de mes y primero de semana,
          // mostramos todo lo que quieran
          return column.week &&
            (index === 0 || (column.isFirstOfMonth && column.isFirstOfWeek)) ? (
            <td key={`column-${column.key}`} colSpan={colSpan}>
              <div className="timelineInfo">
                <MonthPill dayKey={column.key}></MonthPill>
                <WeekPill
                  week={column.week}
                  festivities={weeksFestivitiesCount[column.week]}
                ></WeekPill>
              </div>
            </td>
          ) : // Si es primero de mes mostramos solo la info del mes
          column.isFirstOfMonth ? (
            <td key={`column-${column.key}`} colSpan={colSpan}>
              <div className="timelineInfo">
                <MonthPill dayKey={column.key}></MonthPill>
              </div>
            </td>
          ) : column.week && column.isFirstOfWeek ? (
            // Si es primero de semana pues la info de la semana
            <td key={`column-${column.key}`} colSpan={colSpan}>
              <div className="timelineInfo">
                <WeekPill
                  week={column.week}
                  festivities={weeksFestivitiesCount[column.week]}
                ></WeekPill>
              </div>
            </td>
          ) : (
            // Y si no es nada, todo vacio
            <td colSpan={colSpan}></td>
          );
        })}
      </tr>
    </>
  );
}
