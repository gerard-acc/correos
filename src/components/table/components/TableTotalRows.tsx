import { Fragment } from "react/jsx-runtime";
import type {
  ColumnStructure,
  RowStructure,
  SubColumn,
  TableProps,
} from "../interfaces";
import { useEffect, useState } from "react";
import {
  getCalculatedAggregatedNumber,
  getCalculatedSubcolumnNumber,
  sumAggregatedForDays,
  sumSubcolumnForDays,
  getMonthDayKeysForTotalColumn,
} from "../utils";
import { getISOWeek, parse } from "date-fns";

interface TableTotalRows {
  currentPeriod: TableProps["periods"];
  columns: ColumnStructure[];
  subcolumnsStructure?: SubColumn;
  rows: RowStructure[];
}

interface LocalSums {
  [key: string]: number | SubColumn;
}

export default function TableTotalRows({
  currentPeriod,
  columns,
  subcolumnsStructure,
  rows,
}: TableTotalRows) {
  const [totals, setTotals] = useState<LocalSums>({});

  // Para obtener los totales, sumamos lo que nos convenga cogiendolo de columns y rows
  useEffect(() => {
    // Padres de nivel 0 (los más altos)
    const topParents = rows.filter((r) => r.type === "parent" && r.level === 0);

    const computedTotals: LocalSums = {};

    if (currentPeriod === "daily") {
      // Totales por día y columna "Total del mes" (vista diaria)
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const col = columns[colIndex];

        // Cuando la columna es el "Total del mes", sumamos sobre los días del mes
        if (col.isMonthlyTotal) {
          const monthDays = getMonthDayKeysForTotalColumn(columns, colIndex);
          if (
            subcolumnsStructure &&
            Object.keys(subcolumnsStructure).length > 0
          ) {
            const monthTotals: SubColumn = {};
            for (const key of Object.keys(subcolumnsStructure)) {
              const totalForKey = topParents.reduce(
                (acc, row) =>
                  acc + sumSubcolumnForDays(monthDays, row, rows, key),
                0,
              );
              monthTotals[key] = totalForKey;
            }
            computedTotals[col.key] = monthTotals;
          } else {
            const total = topParents.reduce(
              (acc, row) => acc + sumAggregatedForDays(monthDays, row, rows),
              0,
            );
            computedTotals[col.key] = total;
          }
          continue;
        }

        // Columnas de días normales
        if (
          subcolumnsStructure &&
          Object.keys(subcolumnsStructure).length > 0
        ) {
          const dayTotals: SubColumn = {};
          for (const key of Object.keys(subcolumnsStructure)) {
            const totalForKey = topParents.reduce(
              (acc, row) =>
                acc + getCalculatedSubcolumnNumber(col.key, row, rows, key),
              0,
            );
            dayTotals[key] = totalForKey;
          }
          computedTotals[col.key] = dayTotals;
        } else {
          const total = topParents.reduce(
            (acc, row) =>
              acc + getCalculatedAggregatedNumber(col.key, row, rows),
            0,
          );
          computedTotals[col.key] = total;
        }
      }
    } else {
      // Totales por semana (vista semanal)
      // Construimos el mapa semana -> lista de días a partir de las columnas
      const weeksMap: { [week: number]: string[] } = {};
      for (const col of columns) {
        if (col.isMonthlyTotal) continue; // skip monthly total pseudo-columns
        const date = parse(col.key, "dd/MM/yyyy", new Date());
        const week = getISOWeek(date);
        if (!weeksMap[week]) weeksMap[week] = [];
        weeksMap[week].push(col.key);
      }
      // Ordenamos los días dentro de cada semana para consistencia
      Object.values(weeksMap).forEach((arr) =>
        arr.sort((a, b) => {
          const da = parse(a, "dd/MM/yyyy", new Date()).getTime();
          const db = parse(b, "dd/MM/yyyy", new Date()).getTime();
          return da - db;
        }),
      );

      const weekKeys = Object.keys(weeksMap)
        .map((w) => parseInt(w, 10))
        .sort((a, b) => a - b);

      for (const week of weekKeys) {
        const days = weeksMap[week];
        if (
          subcolumnsStructure &&
          Object.keys(subcolumnsStructure).length > 0
        ) {
          const weekTotals: SubColumn = {};
          for (const key of Object.keys(subcolumnsStructure)) {
            const totalForKey = topParents.reduce(
              (acc, row) => acc + sumSubcolumnForDays(days, row, rows, key),
              0,
            );
            weekTotals[key] = totalForKey;
          }
          computedTotals[String(week)] = weekTotals;
        } else {
          const total = topParents.reduce(
            (acc, row) => acc + sumAggregatedForDays(days, row, rows),
            0,
          );
          computedTotals[String(week)] = total;
        }
      }
    }

    setTotals(computedTotals);
  }, [rows, columns, subcolumnsStructure, currentPeriod]);

  return (
    <>
      <tr>
        <td>Total</td>
        {currentPeriod === "daily"
          ? columns.map((column) =>
              subcolumnsStructure ? (
                <Fragment key={column.key}>
                  {Object.keys(subcolumnsStructure).map((key) => (
                    <td key={`${column.key}-${key}-total1`}>
                      {(totals[column.key] as SubColumn)?.[key]}
                    </td>
                  ))}
                  <td>
                    {Object.values(
                      (totals[column.key] as SubColumn) || {},
                    ).reduce((acc, v) => acc + (v || 0), 0)}
                  </td>
                </Fragment>
              ) : (
                <td key={`${column.key}-total`}>
                  {totals[column.key] as number}
                </td>
              ),
            )
          : // Weekly rendering
            (() => {
              // Reuse the same weeks calculation used above (derive from columns)
              const weeksMap: { [week: number]: string[] } = {};
              for (const col of columns) {
                if (col.isMonthlyTotal) continue;
                const date = parse(col.key, "dd/MM/yyyy", new Date());
                const week = getISOWeek(date);
                if (!weeksMap[week]) weeksMap[week] = [];
                weeksMap[week].push(col.key);
              }
              const weekKeys = Object.keys(weeksMap)
                .map((w) => parseInt(w, 10))
                .sort((a, b) => a - b);
              return weekKeys.map((week) =>
                subcolumnsStructure ? (
                  <Fragment key={`week-${week}`}>
                    {Object.keys(subcolumnsStructure).map((key) => (
                      <td key={`week-${week}-${key}-total1`}>
                        {(totals[String(week)] as SubColumn)?.[key]}
                      </td>
                    ))}
                    <td key={`week-${week}-total`}>
                      {Object.values(
                        (totals[String(week)] as SubColumn) || {},
                      ).reduce((acc, v) => acc + (v || 0), 0)}
                    </td>
                  </Fragment>
                ) : (
                  <td key={`week-${week}-total`}>
                    {(totals[String(week)] as number) ?? 0}
                  </td>
                ),
              );
            })()}
      </tr>
      <tr>
        <td>Total modificado</td>
      </tr>
      <tr>
        <td>Resto</td>
      </tr>
      <tr>
        <td>Total general</td>
      </tr>
    </>
  );
}
