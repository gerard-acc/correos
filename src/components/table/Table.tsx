import "./table.css";
import { useEffect, useState, useMemo } from "react";
import type { RowStructure, TableProps } from "./interfaces";
import {
  buildRows,
  getDayNumberFrom,
  getValueFor,
  getNewExpandedParents,
  getCalculatedValue,
} from "./utils";

export default function Table({ data }: TableProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [nestedRows, setNestedRows] = useState<RowStructure[]>([]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );
  const [editingCell, setEditingCell] = useState<string | null>(null);

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
    setColumns(Object.keys(data));
    setNestedRows(buildRows(data));
  }, [data]);

  const toggleParent = (toggledParent: string) => {
    setExpandedParents((prev) => getNewExpandedParents(toggledParent, prev));
  };

  const updateCellValue = (rowIndex: number, column: string, value: string) => {
    const row = visibleRows[rowIndex];
    if (row.type === "child" && row.rowData) {
      row.rowData[column] = parseFloat(value) || 0;
    } else if (row.type === "parent") {
      if (!row.customValues) row.customValues = {};
      row.customValues[column] = parseFloat(value) || 0;
    }
    setNestedRows([...nestedRows]);
    setEditingCell(null);
  };

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
              {columns.map((day) => {
                const cellKey = `${index}-${day}`;
                const isEditing = editingCell === cellKey;
                const currentValue = row.type === "child" 
                  ? getValueFor(day, row.rowData)
                  : getCalculatedValue(day, row, nestedRows);
                
                return (
                  <td 
                    key={day}
                    onClick={() => setEditingCell(cellKey)}
                    style={{ cursor: "pointer" }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={currentValue.replace(/,/g, "")}
                        onBlur={(e) => updateCellValue(index, day, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateCellValue(index, day, e.currentTarget.value);
                          if (e.key === "Escape") setEditingCell(null);
                        }}
                        autoFocus
                        style={{ width: "100%", border: "1px solid #ccc", padding: "2px" }}
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
  );
}
