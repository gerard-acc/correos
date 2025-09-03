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

    const childRows = allRows.filter(
      (r) =>
        r.type === "child" && r.parentKey && r.parentKey.startsWith(row.key!),
    );
    const total = childRows.reduce((acc, current) => {
      if (current.rowData && current.rowData[day]) {
        const value = current.rowData[day];
        if (typeof value === "object" && value[subColumn] !== undefined) {
          return acc + value[subColumn];
        }
      }
      return acc;
    }, 0);

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
    const total = childRows.reduce((acc, current) => {
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

export const getDayNumberFrom = (date: string) => {
  return date.split("/")[0];
};

export const isObjectEmpty = (object: object) => {
  return Object.keys(object).length === 0;
};
