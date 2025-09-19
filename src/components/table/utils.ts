import type {
  ColumnStructure,
  DataStructure,
  RowData,
  RowStructure,
  SubColumn,
} from "./interfaces";
import { getISOWeek, parse } from "date-fns";

// Construye un objeto con todas las columnas de la tabla, es decir el dia, si es festivo, etc (ver interfaz ColumnStructure)
// La única complejidad es que hay tres tipos de columna, la normal con el dia y su valor, la normal pero con subcolumnas, que
// al final es que en vez del valor tiene un objeto con los distintos valores de las subcolumnas, y la columna de Total que
// aparece al final de cada mes
export const buildColumns = (data: DataStructure): ColumnStructure[] => {
  const columns = Object.keys(data).map((day) => {
    const column: ColumnStructure = {
      key: day,
      isFestivity: data[day].isFestivity,
      week: getISOWeek(parse(day, "dd/MM/yyyy", new Date())),
      isFirstOfMonth: parse(day, "dd/MM/yyyy", new Date()).getDate() === 1,
      isFirstOfWeek: parse(day, "dd/MM/yyyy", new Date()).getDay() === 1,
    };

    const subColumns = Object.values(data[day].rows)[0].volumen;

    if (typeof subColumns === "object") {
      column.subColumns = subColumns;
    }

    return column;
  });

  // Añadimos una columna de totales al final de cada mes y al final de la tabla
  const columnsWithTotals: ColumnStructure[] = [];
  let currentMonth = -1;
  columns.forEach((col) => {
    const month = parse(col.key, "dd/MM/yyyy", new Date()).getMonth() + 1;
    if (month !== currentMonth) {
      if (currentMonth !== -1) {
        columnsWithTotals.push({
          key: `total-${currentMonth}`,
          isFestivity: false,
          isMonthlyTotal: true,
        });
      }
      currentMonth = month;
    }
    columnsWithTotals.push(col);
  });
  columnsWithTotals.push({
    key: `total-${currentMonth}`,
    isFestivity: false,
    isMonthlyTotal: true,
  });

  return columnsWithTotals;
};

// Construye las filas. No tiene la info anidada para las subfilas, es un objeto plano y cada fila tiene info de si es padre, de qué
// nivel, etc
export const buildRows = (data: DataStructure): RowStructure[] => {
  // Las filas se complican porque tienen subfilas
  const rowStructure: RowStructure[] = [];
  const processedParents = new Set<string>();
  const allRows = new Map<
    string,
    { rowParents: string[]; data: { [date: string]: number | SubColumn } }
  >();

  // Primero guardamos todas las filas finales, las que no son desplegables, con su valor, en allRows
  for (const day in data) {
    const dayRows = data[day].rows;
    for (const rowName in dayRows) {
      if (!allRows.has(rowName)) {
        allRows.set(rowName, {
          rowParents: dayRows[rowName].rowParents,
          data: {},
        });
      }
      allRows.get(rowName)!.data[day] = dayRows[rowName].volumen;
    }
  }

  // Después metemos todas las filas que hemos sacado en una estructura en base a las rowParents
  allRows.forEach((rowInfo, rowName) => {
    rowInfo.rowParents.forEach((parent, index) => {
      const parentKey = rowInfo.rowParents.slice(0, index + 1).join("|");
      if (!processedParents.has(parentKey)) {
        rowStructure.push({
          type: "parent",
          name: parent,
          level: index,
          key: parentKey,
        });
        processedParents.add(parentKey);
      }
    });

    // Metemos dentro del desplegable correcto cada row final
    rowStructure.push({
      type: "child",
      name: rowName,
      level: rowInfo.rowParents.length,
      rowData: rowInfo.data,
      parentKey: rowInfo.rowParents.join("|"),
    });
  });

  return rowStructure;
};

export const getWeekKeys = (weeksMap: { [week: number]: string[] }) => {
  return Object.keys(weeksMap)
    .map((w) => parseInt(w, 10))
    .sort((a, b) => a - b);
};

// Agrupa columnas por semana aprovechando la propiedad `week` calculada en buildColumns
export const groupColumnsByWeek = (
  columns: ColumnStructure[],
): { [week: number]: string[] } => {
  const weeks: { [week: number]: string[] } = {};
  for (const c of columns) {
    if (c.isMonthlyTotal || !c.week) continue;
    if (!weeks[c.week]) weeks[c.week] = [];
    weeks[c.week].push(c.key);
  }
  return weeks;
};

// Obtiene le valor base de una celda HIJA (las que tienen la data real del backend) simplemente cogiendo la data que hay en la row para la columna de la celda
export const getValueFor = (
  day: string,
  rowData: RowData | undefined,
  subColumn?: string,
) => {
  if (!rowData || !rowData[day]) return "";
  if (subColumn) {
    if (typeof rowData[day] === "object") {
      return rowData[day][subColumn];
    }
  } else {
    return rowData[day].toLocaleString();
  }
  return "";
};

// Utilidades simples solo para obtener las cosas de una manera descriptiva por ai
export const getDayNumberFrom = (date: string) => {
  return date.split("/")[0];
};

export const isObjectEmpty = (object: object) => {
  return Object.keys(object).length === 0;
};

/**
 * Aquí se pone chungo, confié a tope en la IA para estos cálculos, pero creo que hay algunas cosas que se pueden optimizar mucho.
 * El problema es que no me da la cabeza.
 */

// Se usa en los PADRES (los que la info que tienen es calculada a partir de sus filas hijas)
// Tiene en cuenta las modificaciones de las hijas, las filas que son hijas pero
// padre a la vez, etc.
export const getCalculatedValue = (
  day: string,
  row: RowStructure,
  allRows: RowStructure[],
  subColumn?: string,
) => {
  if (subColumn) {
    if (
      row.customValues &&
      row.customValues[day] !== undefined &&
      typeof row.customValues[day] === "object" &&
      row.customValues[day][subColumn] !== undefined
    ) {
      return row.customValues[day][subColumn].toLocaleString();
    }

    // Sum of all leaf child rows under this parent
    const childRows = allRows.filter(
      (r) =>
        r.type === "child" && r.parentKey && r.parentKey.startsWith(row.key!),
    );
    let total = childRows.reduce((acc, current) => {
      if (current.rowData && current.rowData[day]) {
        const value = current.rowData[day];
        if (typeof value === "object" && value[subColumn] !== undefined) {
          return acc + value[subColumn];
        }
      }
      return acc;
    }, 0);

    // Plus deltas from immediate child parents that have overrides
    const directChildParents = allRows.filter((r) => {
      if (r.type !== "parent" || !r.key || !row.key) return false;
      const parts = r.key.split("|");
      return parts.slice(0, -1).join("|") === row.key;
    });
    directChildParents.forEach((p) => {
      const override = p.customValues?.[day];
      if (!override || typeof override !== "object") return;
      if (override[subColumn] === undefined) return; // only apply explicit subcolumn override
      const underLeaf = allRows
        .filter(
          (r) =>
            r.type === "child" && r.parentKey && r.parentKey.startsWith(p.key!),
        )
        .reduce((acc, current) => {
          const value = current.rowData?.[day];
          if (typeof value === "object" && value[subColumn] !== undefined) {
            return acc + value[subColumn];
          }
          return acc;
        }, 0);
      total += (override[subColumn] || 0) - underLeaf;
    });

    if (!row.rowData) row.rowData = {};
    if (typeof row.rowData[day] !== "object") row.rowData[day] = {};
    (row.rowData[day] as SubColumn)[subColumn] = total;

    return total.toLocaleString();
  } else {
    // If parent has custom value, use it instead of calculated
    if (row.customValues && row.customValues[day] !== undefined) {
      return row.customValues[day].toLocaleString();
    }

    // Necesitamos sumar todas las filas hijas que cuelgan de este padre
    const childRows = allRows.filter(
      (r) =>
        r.type === "child" && r.parentKey && r.parentKey.startsWith(row.key!),
    );
    let total = childRows.reduce((acc, current) => {
      if (current.rowData && current.rowData[day]) {
        const value = current.rowData[day];
        if (typeof value === "number") {
          return acc + value;
        } else if (typeof value === "object") {
          // Sum all subcolumn values when dealing with objects
          return (
            acc + Object.values(value).reduce((sum, subVal) => sum + subVal, 0)
          );
        }
      }
      return acc;
    }, 0);

    // Plus deltas from immediate child parents that have overrides
    const directChildParents = allRows.filter((r) => {
      if (r.type !== "parent" || !r.key || !row.key) return false;
      const parts = r.key.split("|");
      return parts.slice(0, -1).join("|") === row.key;
    });
    directChildParents.forEach((p) => {
      const override = p.customValues?.[day];
      if (override === undefined) return;
      // Sum leaf under this immediate child parent
      const underLeaf = allRows
        .filter(
          (r) =>
            r.type === "child" && r.parentKey && r.parentKey.startsWith(p.key!),
        )
        .reduce((acc, current) => {
          const value = current.rowData?.[day];
          if (typeof value === "number") return acc + value;
          if (typeof value === "object")
            return acc + Object.values(value).reduce((s, v) => s + (v || 0), 0);
          return acc;
        }, 0);
      const overrideTotal =
        typeof override === "number"
          ? override
          : Object.values(override as SubColumn).reduce(
              (s, v) => s + (v || 0),
              0,
            );
      total += overrideTotal - underLeaf;
    });

    // Set the calculated value in the row's rowData property
    if (!row.rowData) {
      row.rowData = {};
    }

    // Store the calculated value, considering subColumn if specified
    row.rowData[day] = total;

    return total.toLocaleString();
  }
};

// Se usa en TableTotalCell (las columnas de total de cuando hay subcolumnas) para calcular el valor
export const getCalculatedSubcolumnNumber = (
  day: string,
  row: RowStructure,
  allRows: RowStructure[],
  subColumn: string,
) => {
  // If parent has an explicit override for this subcolumn, just return it
  if (
    row.customValues &&
    row.customValues[day] !== undefined &&
    typeof row.customValues[day] === "object" &&
    row.customValues[day][subColumn] !== undefined
  ) {
    return row.customValues[day][subColumn] || 0;
  }

  // Base: sum of leaf child rows under this parent for the subcolumn
  const childRows = allRows.filter(
    (r) =>
      r.type === "child" && r.parentKey && r.parentKey.startsWith(row.key!),
  );
  let total = childRows.reduce((acc, current) => {
    if (current.rowData && current.rowData[day]) {
      const value = current.rowData[day];
      if (typeof value === "object" && value[subColumn] !== undefined) {
        return acc + value[subColumn];
      }
    }
    return acc;
  }, 0);

  // Delta: immediate child parents' overrides for this subcolumn
  const directChildParents = allRows.filter((r) => {
    if (r.type !== "parent" || !r.key || !row.key) return false;
    const parts = r.key.split("|");
    return parts.slice(0, -1).join("|") === row.key;
  });
  directChildParents.forEach((p) => {
    const override = p.customValues?.[day];
    if (!override || typeof override !== "object") return;
    if (override[subColumn] === undefined) return;

    const underLeaf = allRows
      .filter(
        (r) =>
          r.type === "child" && r.parentKey && r.parentKey.startsWith(p.key!),
      )
      .reduce((acc, current) => {
        const value = current.rowData?.[day];
        if (typeof value === "object" && value[subColumn] !== undefined) {
          return acc + value[subColumn];
        }
        return acc;
      }, 0);

    total += (override[subColumn] || 0) - underLeaf;
  });

  return total;
};

// Se usa en varios sitios para calcular un total
export const getCalculatedAggregatedNumber = (
  day: string,
  row: RowStructure,
  allRows: RowStructure[],
) => {
  // If parent has explicit numeric override, use it
  if (row.customValues && typeof row.customValues[day] === "number") {
    return row.customValues[day] as number;
  }

  // Base: sum of leaf child rows under this parent for the day
  const childRows = allRows.filter(
    (r) =>
      r.type === "child" && r.parentKey && r.parentKey.startsWith(row.key!),
  );
  let total = childRows.reduce((acc, current) => {
    const value = current.rowData?.[day];
    if (typeof value === "number") return acc + value;
    if (typeof value === "object")
      return acc + Object.values(value).reduce((s, v) => s + (v || 0), 0);
    return acc;
  }, 0);

  // Delta: immediate child parents' overrides (numeric or object)
  const directChildParents = allRows.filter((r) => {
    if (r.type !== "parent" || !r.key || !row.key) return false;
    const parts = r.key.split("|");
    return parts.slice(0, -1).join("|") === row.key;
  });
  directChildParents.forEach((p) => {
    const override = p.customValues?.[day];
    if (override === undefined) return;

    const underLeaf = allRows
      .filter(
        (r) =>
          r.type === "child" && r.parentKey && r.parentKey.startsWith(p.key!),
      )
      .reduce((acc, current) => {
        const v = current.rowData?.[day];
        if (typeof v === "number") return acc + v;
        if (typeof v === "object")
          return acc + Object.values(v).reduce((s, n) => s + (n || 0), 0);
        return acc;
      }, 0);

    const overrideTotal =
      typeof override === "number"
        ? override
        : Object.values(override as SubColumn).reduce(
            (s, v) => s + (v || 0),
            0,
          );
    total += overrideTotal - underLeaf;
  });

  return total;
};

// Sum effective aggregated values for a row over a list of day keys (dd/MM/yyyy)
export const sumAggregatedForDays = (
  days: string[],
  row: RowStructure,
  allRows: RowStructure[],
) => {
  if (row.type === "child") {
    // Child: sum own values (numbers or sum of object values)
    return days.reduce((acc, d) => {
      const v = row.rowData?.[d];
      if (typeof v === "number") return acc + v;
      if (typeof v === "object")
        return acc + Object.values(v).reduce((s, n) => s + (n || 0), 0);
      return acc;
    }, 0);
  }
  // Parent: use effective aggregated helper per day
  return days.reduce(
    (acc, d) => acc + getCalculatedAggregatedNumber(d, row, allRows),
    0,
  );
};

// Sum effective subcolumn values for a row over a list of day keys
export const sumSubcolumnForDays = (
  days: string[],
  row: RowStructure,
  allRows: RowStructure[],
  subKey: string,
) => {
  if (row.type === "child") {
    return days.reduce((acc, d) => {
      const v = row.rowData?.[d];
      if (typeof v === "object" && v[subKey] !== undefined)
        return acc + (v[subKey] || 0);
      return acc;
    }, 0);
  }
  return days.reduce(
    (acc, d) => acc + getCalculatedSubcolumnNumber(d, row, allRows, subKey),
    0,
  );
};

// Cogemos los keys de los dias que pertenecen a un mes, ordenados de la columna Total hacia atrás
export const getMonthDayKeysForTotalColumn = (
  columns: ColumnStructure[],
  totalColumnIndex: number,
): string[] => {
  const days: string[] = [];
  for (let i = totalColumnIndex - 1; i >= 0; i--) {
    const c = columns[i];
    if (c.isMonthlyTotal) break;
    days.unshift(c.key);
  }
  return days;
};
