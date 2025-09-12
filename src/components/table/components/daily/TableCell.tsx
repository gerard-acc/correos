import { useEffect, useState } from "react";
import type {
  CellState,
  ColumnStructure,
  RowStructure,
} from "../../interfaces";
import { getCalculatedValue, getValueFor, isObjectEmpty } from "../../utils";

interface TableCell {
  index: number;
  column: ColumnStructure;
  row: RowStructure;
  visibleRows: RowStructure[];
  rows: RowStructure[];
  subColumn?: string;
  isVerifying: boolean;
  updateRows: () => void;
}

export default function TableCell({
  index,
  column,
  row,
  isVerifying,
  visibleRows,
  rows,
  subColumn,
  updateRows,
}: TableCell) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [cellStatus, setCellStatus] = useState<
    "noActivity" | "modified" | "verified"
  >("noActivity");

  useEffect(() => {
    if (subColumn) {
      if (
        row.modifiedCells &&
        row.modifiedCells[column.day] &&
        (row.modifiedCells[column.day] as CellState)[subColumn]
      ) {
        setCellStatus("modified");
      } else if (
        row.verifiedCells &&
        row.verifiedCells[column.day] &&
        (row.verifiedCells[column.day] as CellState)[subColumn]
      ) {
        setCellStatus("verified");
      } else {
        setCellStatus("noActivity");
      }
      return;
    }
    if (row.modifiedCells?.[column.day]) {
      setCellStatus("modified");
    } else if (row.verifiedCells?.[column.day]) {
      setCellStatus("verified");
    } else {
      setCellStatus("noActivity");
    }
  }, [row.modifiedCells, row.verifiedCells, column, subColumn]);

  const updateCellValue = (
    rowIndex: number,
    column: string,
    value: string,
    subColumn?: string,
  ) => {
    const row = visibleRows[rowIndex];
    const key = column;

    if (!row.rowData) return;

    if (!row.rowData[column]) row.rowData[column] = {};
    if (!row.customValues) row.customValues = {};
    if (!row.modifiedCells) row.modifiedCells = {};

    if (row.type === "child") {
      if (subColumn && typeof row.rowData[column] === "object") {
        row.rowData[column][subColumn] = parseFloat(value) || 0;
      } else {
        row.rowData[column] = parseFloat(value) || 0;
      }
    }

    if (row.type === "parent") {
      if (subColumn) {
        if (!row.customValues[key]) row.customValues[key] = {};
        if (typeof row.customValues[key] === "object") {
          row.customValues[key][subColumn] = parseFloat(value) || 0;
        }
      } else {
        row.customValues[key] = parseFloat(value) || 0;
      }
    }

    if (subColumn) {
      if (!row.modifiedCells[key]) row.modifiedCells[key] = {};
      if (typeof row.modifiedCells[key] === "object") {
        row.modifiedCells[key][subColumn] = true;
      }
    } else {
      row.modifiedCells[key] = true;
    }
    row.status = calculateRowStatus(row);
    setEditingCell(null);

    // Force updates
    updateRows();
    row.modifiedCells = { ...row.modifiedCells };
  };

  const verifyCell = (rowIndex: number, column: string) => {
    const row = visibleRows[rowIndex];

    // TODO -> Ver qué quieren en back para validar la celda
    console.log("Validate cell: ", rowIndex, column);

    setTimeout(() => {
      // Delete the modified cell mark
      if (row.modifiedCells && row.modifiedCells[column]) {
        delete row.modifiedCells[column];
      }

      // Add a verified cell mark

      // If verifiedCells doesn't exist, create it
      if (!row.verifiedCells) row.verifiedCells = {};

      // If it's a subcolumn, we need to mark the specific subcolumn as verified
      // If not, we mark the column of this row as verified
      if (subColumn) {
        if (!row.verifiedCells[column]) row.verifiedCells[column] = {};
        if (typeof row.verifiedCells[column] === "object") {
          row.verifiedCells[column][subColumn] = true;
        }
      } else {
        row.verifiedCells[column] = true;
      }

      // We modify the row status based on the cells
      row.status = calculateRowStatus(row);

      // Force updates
      updateRows();
      row.verifiedCells = { ...row.verifiedCells };
    }, 1000);
  };

  const calculateRowStatus = (row: RowStructure) => {
    if (
      row.verifiedCells &&
      Object.keys(row.verifiedCells).length ===
        Object.keys(row.rowData || {}).length
    ) {
      return "allVerified";
    }
    if (row.verifiedCells && !isObjectEmpty(row.verifiedCells)) {
      return "uncompletedVerification";
    }
    return "noActivity";
  };

  const cellKey = `${index}-${column.day}`;
  const isEditing = editingCell === cellKey;
  const currentValue =
    row.type === "child"
      ? getValueFor(column.day, row.rowData, subColumn)
      : getCalculatedValue(column.day, row, rows, subColumn);

  return (
    <td
      key={column.day}
      onClick={() =>
        isVerifying ? verifyCell(index, column.day) : setEditingCell(cellKey)
      }
      style={{
        cursor: "pointer",
        backgroundColor:
          cellStatus === "modified" && !isVerifying
            ? "var(--modified-cell)"
            : cellStatus === "verified" && isVerifying
              ? "var(--verified-cell)"
              : "unset",
        fontStyle: cellStatus === "modified" ? "italic" : "",
      }}
    >
      {isEditing ? (
        <input
          type="text"
          defaultValue={currentValue}
          onBlur={(e) =>
            updateCellValue(index, column.day, e.target.value, subColumn)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateCellValue(
                index,
                column.day,
                e.currentTarget.value,
                subColumn,
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
}
