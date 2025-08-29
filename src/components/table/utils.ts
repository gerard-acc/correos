import { es } from "date-fns/locale";
import type {
  ColumnStructure,
  DataStructure,
  RowStructure,
} from "./interfaces";
import { format, getISOWeek, parse } from "date-fns";

const findInconsistenciesIn = (data: DataStructure) => {
  // TODO - If there are subcolumns in the day, all rows need to have the same subcolumns
};

export const buildColumns = (data: DataStructure) => {
  /**
   * Aquí construim els dies, i el que necessito és que dintre els dies hi hagi
   * columnes. És a dir, la columna final ja no és el dia, sino el volumen
   */
  const columns = Object.keys(data).map((day) => {
    const column = {
      day: day,
      isFestivity: data[day].isFestivity,
    };

    const subColumns = Object.values(data[day].rows)[0].volumen;

    if (typeof subColumns === "object") {
      column.subColumns = subColumns;
    }

    return column;
  });

  console.log({ columns });

  return columns;
};

export const getSubcolumnsStructure = (columns: ColumnStructure[]) => {
  console.log({ columns });
  return columns[0]?.subColumns;
};

export const buildRows = (data: DataStructure) => {
  // Las filas se complican porque tienen subfilas
  const rowStructure: RowStructure[] = [];
  const processedParents = new Set<string>();
  const allRows = new Map<
    string,
    { rowParents: string[]; data: { [date: string]: number } }
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

  console.log({ allRows });

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

  console.log({ rowStructure });

  return rowStructure;
};

export const getNewExpandedParents = (
  toggledParent: string,
  currentParents: Set<string>,
) => {
  const expandedParents = new Set(currentParents);
  // Si el padre ya estaba abierto, lo cerramos y cerramos todos sus hijos
  if (expandedParents.has(toggledParent)) {
    expandedParents.delete(toggledParent);
    Array.from(expandedParents).forEach((expandedKey) => {
      if (expandedKey.startsWith(toggledParent + "|")) {
        expandedParents.delete(expandedKey);
      }
    });
  } else {
    // Si no estaba abierto, lo abrimos
    expandedParents.add(toggledParent);
  }

  console.log({ expandedParents });
  return expandedParents;
};

export const getValueFor = (
  day: string,
  rowData: { [date: string]: number } | undefined,
) => {
  if (!rowData || !rowData[day]) return "";
  return rowData[day].toLocaleString();
};

export const getDayNumberFrom = (date: string) => {
  return date.split("/")[0];
};

export const isObjectEmpty = (object: any) => {
  return Object.keys(object).length === 0;
};

// TODO - Repasar esto, que me parece medio raro
export const getCalculatedValue = (
  day: string,
  row: RowStructure,
  allRows: RowStructure[],
) => {
  if (row.type === "child") return "";

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
      return acc + current.rowData[day];
    }
    return acc;
  }, 0);

  // Set the calculated value in the row's rowData property
  if (!row.rowData) {
    row.rowData = {};
  }
  row.rowData[day] = total;

  return total.toLocaleString();
};

export const buildWeeks = (data: DataStructure) => {
  const weeks = {};

  for (const day in data) {
    const date = parse(day, "dd/MM/yyyy", new Date());
    const weekNumber = getISOWeek(date);

    if (!weeks[weekNumber]) {
      weeks[weekNumber] = { days: 0 };
    }
    weeks[weekNumber].days = weeks[weekNumber].days + 1;
  }

  console.log(weeks);

  return weeks;
};

export const buildMonths = (data: DataStructure) => {
  const months = {};

  for (const day in data) {
    const monthNumber = parseInt(day.split("/")[1]);
    const year = parseInt(day.split("/")[2]);

    const date = new Date(year, monthNumber - 1);

    const key = `${monthNumber}/${year}`;
    if (!months[key]) {
      months[key] = {
        monthNumber,
        monthName: format(date, "MMMM", { locale: es }),
        year,
        days: 0,
      };
    }
    months[key].days = months[key].days + 1;
  }

  return months;
};

export const getMonthTotal = (month: string, allRows: RowStructure[]) => {
  const monthNum = parseInt(month.split("/")[0]);
  const year = parseInt(month.split("/")[1]);

  let totalSum = 0;
  for (const row of allRows) {
    if (!row.rowData || row.level !== 0) continue;

    let rowSum = 0;
    for (const key in row.rowData) {
      const keyMonth = parseInt(key.split("/")[1]);
      const keyYear = parseInt(key.split("/")[2]);

      const modifiedValue = row.customValues?.[key];
      if (keyMonth === monthNum && keyYear === year) {
        rowSum += modifiedValue || row.rowData[key];
      }
    }
    totalSum += rowSum;
  }

  return totalSum;
};

export const getWeekTotal = (week: string, allRows: RowStructure[]) => {
  const weekNum = parseInt(week);

  let totalSum = 0;
  for (const row of allRows) {
    if (!row.rowData || row.level !== 0) continue;

    let rowSum = 0;
    for (const key in row.rowData) {
      const date = parse(key, "dd/MM/yyyy", new Date());
      const keyWeek = getISOWeek(date);

      const modifiedValue = row.customValues?.[key];
      if (keyWeek === weekNum) {
        rowSum += modifiedValue || row.rowData[key];
      }
    }
    totalSum += rowSum;
  }

  return totalSum;
};

export const getWeekWordays = (week: string, columns: ColumnStructure[]) => {
  const weekNum = parseInt(week);

  let totalWorkdays = 0;

  for (const column of columns) {
    const date = parse(column.day, "dd/MM/yyyy", new Date());
    const keyWeek = getISOWeek(date);

    if (keyWeek === weekNum && !column.isFestivity) {
      totalWorkdays++;
    }
  }

  return totalWorkdays;
};
