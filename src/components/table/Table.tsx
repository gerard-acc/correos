import "./table.css";
import { useEffect, useState, useMemo } from "react";
import type {
  ColumnStructure,
  MonthStructure,
  RowStructure,
  TableProps,
  WeekStructure,
} from "./interfaces";
import {
  buildRows,
  getDayNumberFrom,
  getValueFor,
  getNewExpandedParents,
  getCalculatedValue,
  buildColumns,
  isObjectEmpty,
  buildWeeks,
  buildMonths,
  getMonthTotal,
  getWeekTotal,
  getWeekWordays,
} from "./utils";
import Toggle from "../common/toggle/Toggle";

export default function Table({ data }: TableProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [weeksRow, setWeeksRow] = useState<WeekStructure>({});
  const [monthsRow, setMonthsRow] = useState<MonthStructure>({});
  const [columns, setColumns] = useState<ColumnStructure[]>([]);
  const [nestedRows, setNestedRows] = useState<RowStructure[]>([]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );
  const [editingCell, setEditingCell] = useState<string | null>(null);

  /** TODO - Construir weeksRow i monthsRow en base al data recibido
   * I refrescarlo cuando cambiamos un volumen en la tabla
   *
   * Fer algo semblant per les setmanes, hauré de fer algo per
   * saber el número de la setmana a partir del dia, i ia
   * Hi haurà el problema de les setmanes partides en dos mesos
   * Potser si ho faig a partir de l'objecte aquet no serà tant difícil
   */

  const visibleRows = useMemo(() => {
    return nestedRows.filter((row: RowStructure): boolean => {
      if (row.type === "parent" && row.key) {
        const parentParts = row.key.split("|");
        for (let i = 1; i < parentParts.length; i++) {
          const ancestorKey = parentParts.slice(0, i).join("|");
          if (!expandedParents.has(ancestorKey)) {
            return false;
          }
        }
        return true;
      }

      if (!row.parentKey) return true;

      const parentParts = row.parentKey.split("|");
      for (let i = 1; i <= parentParts.length; i++) {
        const parentKey = parentParts.slice(0, i).join("|");
        if (!expandedParents.has(parentKey)) {
          return false;
        }
      }
      return true;
    });
  }, [nestedRows, expandedParents]);

  useEffect(() => {
    setColumns(buildColumns(data));
    setNestedRows(buildRows(data));
    setWeeksRow(buildWeeks(data));
    setMonthsRow(buildMonths(data));
  }, [data]);

  const toggleParent = (toggledParent: string) => {
    setExpandedParents((prev) => getNewExpandedParents(toggledParent, prev));
  };

  const updateCellValue = (rowIndex: number, column: string, value: string) => {
    const row = visibleRows[rowIndex];
    if (row.type === "child" && row.rowData) {
      if (!row.customValues) row.customValues = {};
      row.customValues[column] = parseFloat(value) || 0;
      row.rowData[column] = parseFloat(value) || 0;

      if (!row.modifiedCells) row.modifiedCells = {};
      row.modifiedCells[column] = true;
    } else if (row.type === "parent") {
      if (!row.customValues) row.customValues = {};
      row.customValues[column] = parseFloat(value) || 0;

      if (!row.modifiedCells) row.modifiedCells = {};
      row.modifiedCells[column] = true;
    }
    row.status = calculateRowStatus(row);

    setNestedRows([...nestedRows]);
    setEditingCell(null);
  };

  const verifyCell = (rowIndex: number, column: string) => {
    const row = visibleRows[rowIndex];

    if (!row.modifiedCells?.[column]) {
      console.log("Only modified cells can be verified");
      return;
    }
    // TODO -> Ver qué quieren en back para validar la celda
    console.log("Validate cell: ", rowIndex, column);

    setTimeout(() => {
      delete row.modifiedCells![column];

      if (!row.verifiedCells) row.verifiedCells = {};
      row.verifiedCells[column] = true;

      row.status = calculateRowStatus(row);
      setNestedRows([...nestedRows]);

      console.log({ modified: row.modifiedCells, verified: row.verifiedCells });
    }, 1000);
  };

  const calculateRowStatus = (row: RowStructure) => {
    if (row.modifiedCells && !isObjectEmpty(row.modifiedCells)) {
      return "presentModifications";
    }
    if (row.verifiedCells && !isObjectEmpty(row.verifiedCells)) {
      return "allVerified";
    }
    return "noActivity";
  };

  return (
    <>
      <div className="tableOptions">
        <Toggle
          onChange={(status) => setIsVerifying(status)}
          label="Verificar"
        ></Toggle>
        <button>Descargar</button>
      </div>
      <div className="tableContainer">
        {isVerifying ? "Is being verifyied" : ""}
        <table>
          <thead>
            <tr className="monthRow">
              <td></td>
              {Object.keys(monthsRow).map((month) => {
                const current = monthsRow[month];
                return (
                  <td colSpan={current.days}>
                    {current.monthName} {current.year} Total:{" "}
                    {getMonthTotal(month, nestedRows)}
                  </td>
                );
              })}
            </tr>
            <tr className="workdaysRow">
              <td></td>
              {Object.keys(weeksRow).map((week) => {
                const current = weeksRow[parseInt(week)];
                return (
                  <td colSpan={current.days}>
                    Días laborables: {getWeekWordays(week, columns)}
                  </td>
                );
              })}
            </tr>
            <tr className="weekRow">
              <td></td>
              {Object.keys(weeksRow).map((week) => {
                const current = weeksRow[parseInt(week)];
                return (
                  <td colSpan={current.days}>
                    Semana {week} Total: {getWeekTotal(week, nestedRows)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td></td>
              {columns.map((column) => (
                <td
                  style={{
                    backgroundColor: column.isFestivity
                      ? "var(--festivity-color)"
                      : "var(--header-color)",
                  }}
                  key={column.day}
                >
                  Día {getDayNumberFrom(column.day)}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={`${row.type}-${index}`}
                className={`level-${row.level} ${row.type}`}
              >
                <td
                  style={{
                    paddingLeft: `${row.level * 20}px`,
                    cursor: row.type === "parent" ? "pointer" : "default",
                    borderLeft: `4px solid ${row.status === "allVerified" ? "var(--verified-cell)" : row.status === "presentModifications" ? "var(--modified-cell)" : "unset"}`,
                  }}
                  onClick={
                    row.type === "parent" && row.key
                      ? () => toggleParent(row.key!)
                      : undefined
                  }
                >
                  {row.type === "parent" && (
                    <span style={{ marginRight: "8px" }}>
                      {row.key && expandedParents.has(row.key) ? "▼" : "▶"}
                    </span>
                  )}
                  {row.name}
                </td>
                {columns.map((column) => {
                  const cellKey = `${index}-${column.day}`;
                  const isEditing = editingCell === cellKey;
                  const currentValue =
                    row.type === "child"
                      ? getValueFor(column.day, row.rowData)
                      : getCalculatedValue(column.day, row, nestedRows);

                  return (
                    <td
                      key={column.day}
                      onClick={() =>
                        isVerifying
                          ? verifyCell(index, column.day)
                          : setEditingCell(cellKey)
                      }
                      style={{
                        cursor: "pointer",
                        backgroundColor: row.modifiedCells?.[column.day]
                          ? "var(--modified-cell)"
                          : row.verifiedCells?.[column.day]
                            ? "var(--verified-cell)"
                            : "unset",
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={currentValue.replace(/,/g, "")}
                          onBlur={(e) =>
                            updateCellValue(index, column.day, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              updateCellValue(
                                index,
                                column.day,
                                e.currentTarget.value,
                              );
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                          autoFocus
                          style={{
                            width: "100%",
                            border: "1px solid #ccc",
                            padding: "2px",
                          }}
                        />
                      ) : (
                        currentValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
