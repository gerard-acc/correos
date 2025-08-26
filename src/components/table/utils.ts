import type { DataStructure, RowStructure } from "./interfaces";

export const getDayNumberFrom = (date: string) => {
  return date.split("/")[0];
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
  Object.entries(data).forEach(([date, rows]) => {
    Object.entries(rows).forEach(([rowName, rowInfo]) => {
      if (!allRows.has(rowName)) {
        allRows.set(rowName, {
          rowParents: rowInfo.rowParents,
          data: {},
        });
      }
      allRows.get(rowName)!.data[date] = rowInfo.volumen;
    });
  });

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

export const getValueFor = (
  day: string,
  rowData: { [date: string]: number } | undefined,
) => {
  if (!rowData || !rowData[day]) return "";
  return rowData[day].toLocaleString();
};
