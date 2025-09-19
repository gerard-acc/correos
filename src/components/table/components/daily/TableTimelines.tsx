import { useMemo } from "react";
import type { ColumnStructure } from "../../interfaces";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TableTimelines {
  columns: ColumnStructure[];
}

const MonthPill = ({ key }: { key: string }) => {
  // Get the month name from the key
  const [monthNum, year] = key.split("/").map((v) => parseInt(v));
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

export default function TableTimelines({ columns }: TableTimelines) {
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
          // Si es el inicio de la tabla, o si coincide que es primero de mes y primero de semana,
          // mostramos todo lo que quieran
          return column.week &&
            (index === 0 || (column.isFirstOfMonth && column.isFirstOfWeek)) ? (
            <td key={`column-${column.week}`}>
              <MonthPill key={column.key}></MonthPill>
              <WeekPill
                week={column.week}
                festivities={weeksFestivitiesCount[column.week]}
              ></WeekPill>
            </td>
          ) : // Si es primero de mes mostramos solo la info del mes
          column.isFirstOfMonth ? (
            <MonthPill key={column.key}></MonthPill>
          ) : column.week && column.isFirstOfWeek ? (
            // Si es primero de semana pues la info de la semana
            <WeekPill
              week={column.week}
              festivities={weeksFestivitiesCount[column.week]}
            ></WeekPill>
          ) : (
            // Y si no es nada, todo vacio
            <td></td>
          );
        })}
      </tr>
    </>
  );
}
