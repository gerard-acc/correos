import { es } from "date-fns/locale";
import type {
  ColumnStructure,
  DataStructure,
  MonthStructure,
  RowData,
  RowStructure,
  SubColumn,
  WeekStructure,
} from "./interfaces";
import { format, getISOWeek, parse } from "date-fns";

// const findInconsistenciesIn = (data: DataStructure) => {
//   TODO - If there are subcolumns in the day, all rows need to have the same subcolumns
//   TODO - If there subcolumns for a day, all days need the same subcolumns
// };

export const buildColumns = (data: DataStructure) => {
  /**
   * Aquí construim els dies, i el que necessito és que dintre els dies hi hagi
   * columnes. És a dir, la columna final ja no és el dia, sino el volumen
   */
  const columns = Object.keys(data).map((day) => {
    const column: ColumnStructure = {
      day: day,
      isFestivity: data[day].isFestivity,
    };

    const subColumns = Object.values(data[day].rows)[0].volumen;

    if (typeof subColumns === "object") {
      column.subColumns = subColumns;
    }

    return column;
  });

  return columns;
};

export const buildRows = (data: DataStructure) => {
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

export const buildWeeks = (data: DataStructure): WeekStructure => {
  const weeks: WeekStructure = {};

  for (const day in data) {
    const date = parse(day, "dd/MM/yyyy", new Date());
    const weekNumber = getISOWeek(date);

    if (!weeks[weekNumber]) {
      weeks[weekNumber] = { days: 0 };
    }
    weeks[weekNumber].days = weeks[weekNumber].days + 1;
  }

  return weeks;
};

// Returns a map of ISO week number -> list of day keys (dd/MM/yyyy)
export const groupDaysByWeek = (
  data: DataStructure,
): { [week: number]: string[] } => {
  const weeks: { [week: number]: string[] } = {};
  for (const day in data) {
    const date = parse(day, "dd/MM/yyyy", new Date());
    const weekNumber = getISOWeek(date);
    if (!weeks[weekNumber]) weeks[weekNumber] = [];
    weeks[weekNumber].push(day);
  }
  // Ensure each week's days are ordered by date ascending
  Object.values(weeks).forEach((arr) =>
    arr.sort((a, b) => {
      const da = parse(a, "dd/MM/yyyy", new Date()).getTime();
      const db = parse(b, "dd/MM/yyyy", new Date()).getTime();
      return da - db;
    }),
  );
  return weeks;
};

export const buildMonths = (data: DataStructure): MonthStructure => {
  const months: MonthStructure = {};

  for (const day in data) {
    const monthNumber = parseInt(day.split("/")[1]);
    const year = parseInt(day.split("/")[2]);

    const date = new Date(year, monthNumber - 1);

    const key = `${monthNumber}/${year}`;
    if (!months[key]) {
      months[key] = {
        monthNum: monthNumber,
        monthName: format(date, "MMMM", { locale: es }),
        year,
        days: 0,
      };
    }
    months[key].days = months[key].days + 1;
  }

  return months;
};

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

export const getSubcolumnsStructure = (columns: ColumnStructure[]) => {
  return columns[0]?.subColumns;
};

// Helper used by TableTotalCell to compute a parent's effective value for a specific subcolumn
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

// Helper to compute a parent's effective aggregated value (no subcolumn)
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

export const getDayNumberFrom = (date: string) => {
  return date.split("/")[0];
};

export const isObjectEmpty = (object: object) => {
  return Object.keys(object).length === 0;
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

// Count non-festive days in a list of day keys using the columns metadata
export const countWorkdaysForDays = (
  days: string[],
  columns: ColumnStructure[],
) => {
  const set = new Set(days);
  let count = 0;
  for (const col of columns) {
    if (set.has(col.day) && !col.isFestivity) count += 1;
  }
  return count;
};
