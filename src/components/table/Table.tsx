import "./table.css";
import { useEffect, useState, useMemo } from "react";
import type {
  ColumnStructure,
  MonthStructure,
  RowStructure,
  SubColumn,
  TableProps,
  WeekStructure,
} from "./interfaces";
import {
  buildRows,
  getDayNumberFrom,
  getNewExpandedParents,
  buildColumns,
  buildWeeks,
  buildMonths,
  getMonthTotal,
  getWeekTotal,
  getWeekWordays,
  getSubcolumnsStructure,
} from "./utils";
import Toggle from "../common/toggle/Toggle";
import TableCell from "./TableCell";

export default function Table({ data, periods }: TableProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [weeksRow, setWeeksRow] = useState<WeekStructure>({});
  const [monthsRow, setMonthsRow] = useState<MonthStructure>({});
  const [subColumnsStructure, setSubColumnsStructure] = useState<
    SubColumn | undefined
  >(undefined);
  const [columns, setColumns] = useState<ColumnStructure[]>([]);
  const [nestedRows, setNestedRows] = useState<RowStructure[]>([]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );

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

  useEffect(() => {
    setSubColumnsStructure(getSubcolumnsStructure(columns));
  }, [columns]);

  useEffect(() => {
    console.log("use", periods, "periods");
  }, [periods]);

  const toggleParent = (toggledParent: string) => {
    setExpandedParents((prev) => getNewExpandedParents(toggledParent, prev));
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
        <table>
          <thead>
            <tr className="monthRow">
              <td></td>
              {Object.keys(monthsRow).map((month) => {
                const current = monthsRow[month];
                return (
                  <td
                    colSpan={
                      subColumnsStructure
                        ? current.days * Object.keys(subColumnsStructure).length
                        : current.days
                    }
                    key={month}
                  >
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
                  <td
                    colSpan={
                      subColumnsStructure
                        ? current.days * Object.keys(subColumnsStructure).length
                        : current.days
                    }
                    key={week}
                  >
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
                  <td
                    colSpan={
                      subColumnsStructure
                        ? current.days * Object.keys(subColumnsStructure).length
                        : current.days
                    }
                    key={week}
                  >
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
                  colSpan={
                    subColumnsStructure
                      ? Object.keys(subColumnsStructure).length
                      : 1
                  }
                >
                  Día {getDayNumberFrom(column.day)}
                </td>
              ))}
            </tr>
            {subColumnsStructure && (
              <tr>
                <td></td>
                {columns.map(() => {
                  return Object.keys(subColumnsStructure).map((key) => (
                    <td key={key}>{key}</td>
                  ));
                })}
              </tr>
            )}
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

                {columns.map((column) =>
                  subColumnsStructure ? (
                    Object.keys(subColumnsStructure).map((key) => (
                      <TableCell
                        key={`${column.day}-${key}-${index}`}
                        index={index}
                        column={column}
                        row={row}
                        isVerifying={isVerifying}
                        visibleRows={visibleRows}
                        nestedRows={nestedRows}
                        subColumn={key}
                        updateRows={() => {
                          setNestedRows([...nestedRows]);
                        }}
                      />
                    ))
                  ) : (
                    <TableCell
                      key={`${column.day}-${index}`}
                      index={index}
                      column={column}
                      row={row}
                      isVerifying={isVerifying}
                      visibleRows={visibleRows}
                      nestedRows={nestedRows}
                      updateRows={() => {
                        setNestedRows([...nestedRows]);
                      }}
                    />
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
