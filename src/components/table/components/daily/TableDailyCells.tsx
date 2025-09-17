import { Fragment } from "react";
import type {
  ColumnStructure,
  RowStructure,
  SubColumn,
} from "../../interfaces";
import TableCell from "./TableCell";
import TableTotalCell from "./TableTotalCell";

interface TableDailyCellsProps {
  row: RowStructure;
  columns: ColumnStructure[];
  subcolumnsStructure?: SubColumn;
  isVerifying: boolean;
  visibleRows: RowStructure[];
  rows: RowStructure[];
  rowIndex: number;
  onUpdateRows: () => void;
}

export default function TableDailyCells({
  row,
  columns,
  subcolumnsStructure,
  isVerifying,
  visibleRows,
  rows,
  rowIndex,
  onUpdateRows,
}: TableDailyCellsProps) {
  return (
    <>
      {columns.map((column) =>
        subcolumnsStructure ? (
          <Fragment key={column.key}>
            {Object.keys(subcolumnsStructure).map((key) => (
              <TableCell
                key={`${column.key}-${key}-${rowIndex}`}
                index={rowIndex}
                column={column}
                row={row}
                isVerifying={isVerifying}
                visibleRows={visibleRows}
                rows={rows}
                subColumn={key}
                updateRows={onUpdateRows}
              />
            ))}
            <TableTotalCell
              day={column.key}
              overrideForDay={row.customValues?.[column.key] as SubColumn}
              baseSubcolumnsForDay={row.rowData?.[column.key] as SubColumn}
              childrenRows={
                row.type === "parent" && row.key
                  ? rows.filter(
                      (r) =>
                        r.type === "child" &&
                        r.parentKey &&
                        r.parentKey.startsWith(row.key!),
                    )
                  : undefined
              }
              allRows={rows}
              row={row}
              subKeys={Object.keys(subcolumnsStructure)}
            />
          </Fragment>
        ) : (
          <TableCell
            key={`${column.key}-${rowIndex}`}
            index={rowIndex}
            column={column}
            row={row}
            isVerifying={isVerifying}
            visibleRows={visibleRows}
            rows={rows}
            updateRows={onUpdateRows}
          />
        ),
      )}
    </>
  );
}
