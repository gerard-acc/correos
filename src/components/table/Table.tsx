import { useEffect, useState } from "react";
import "./table.css";
import type { RowStructure, TableProps } from "./interfaces";
import { buildRows, getDayNumberFrom, getValueFor } from "./utils";

export default function Table({ data }: TableProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [nestedRows, setNestedRows] = useState<RowStructure[]>([]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    // Seteamos las columnas y las filas
    setColumns(Object.keys(data));
    setNestedRows(buildRows(data));
  }, [data]);

  const toggleParent = (parentKey: string) => {
    setExpandedParents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentKey)) {
        newSet.delete(parentKey);
        Array.from(newSet).forEach((expandedKey) => {
          if (expandedKey.startsWith(parentKey + "|")) {
            newSet.delete(expandedKey);
          }
        });
      } else {
        newSet.add(parentKey);
      }
      return newSet;
    });
  };

  const visibleRows = nestedRows.filter((row: RowStructure): boolean => {
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

  return (
    <div className="tableContainer">
      <table>
        <thead>
          <tr>
            <td></td>
            {columns.map((day) => (
              <td key={day}>Día {getDayNumberFrom(day)}</td>
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
              {columns.map((day) => (
                <td key={day}>
                  {row.type === "child" ? getValueFor(day, row.rowData) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
