import { Fragment } from "react/jsx-runtime";
import type {
  ColumnStructure,
  RowStructure,
  SubColumn,
} from "../../interfaces";
import { useEffect, useState } from "react";
import {
  getCalculatedAggregatedNumber,
  getCalculatedSubcolumnNumber,
} from "../../utils";

interface TableTotalRows {
  columns: ColumnStructure[];
  subcolumnsStructure?: SubColumn;
  rows: RowStructure[];
}

interface LocalSums {
  [key: string]: number | SubColumn;
}

export default function TableTotalRows({
  columns,
  subcolumnsStructure,
  rows,
}: TableTotalRows) {
  const [totals, setTotals] = useState<LocalSums>({});

  // Para obtener los totales, sumamos lo que nos convenga cogiendolo de columns y rows
  useEffect(() => {
    // Padres de nivel 0 (los más altos) para sumar por cada día
    const topParents = rows.filter((r) => r.type === "parent" && r.level === 0);

    const computedTotals: LocalSums = {};

    for (const col of columns) {
      // Si hay subcolumnas, sumamos cada una por separado
      if (subcolumnsStructure && Object.keys(subcolumnsStructure).length > 0) {
        const dayTotals: SubColumn = {};
        for (const key of Object.keys(subcolumnsStructure)) {
          const totalForKey = topParents.reduce(
            (acc, row) =>
              acc + getCalculatedSubcolumnNumber(col.day, row, rows, key),
            0,
          );
          dayTotals[key] = totalForKey;
        }
        computedTotals[col.day] = dayTotals;
      } else {
        // Sin subcolumnas, vamos sumando el valor del dia
        const total = topParents.reduce(
          (acc, row) => acc + getCalculatedAggregatedNumber(col.day, row, rows),
          0,
        );
        computedTotals[col.day] = total;
      }
    }

    setTotals(computedTotals);
  }, [rows, columns, subcolumnsStructure]);

  return (
    <>
      <tr>
        <td>Total</td>
        {columns.map((column) =>
          subcolumnsStructure ? (
            <Fragment key={column.day}>
              {Object.keys(subcolumnsStructure).map((key) => (
                <td key={`${column.day}-${key}-total1`}>
                  {(totals[column.day] as SubColumn)?.[key]}
                </td>
              ))}
              <td>
                {Object.values((totals[column.day] as SubColumn) || {}).reduce(
                  (acc, v) => acc + (v || 0),
                  0,
                )}
              </td>
            </Fragment>
          ) : (
            <td>{totals[column.day] as number}</td>
          ),
        )}
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
