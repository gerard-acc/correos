import { Fragment } from "react";
import type {
  ColumnStructure,
  DataStructure,
  RowStructure,
} from "../../interfaces";
import { getDayNumberFrom } from "../../utils";

interface DailyTimelinesProps {
  data: DataStructure;
  columns: ColumnStructure[];
  rows: RowStructure[];
  subcolumnsStructure?: { [key: string]: number };
}

export default function DailyTimelines({
  columns,
  subcolumnsStructure,
}: DailyTimelinesProps) {
  return (
    <>
      <tr>
        <td></td>
        {columns.map((column) => (
          <td
            style={{
              backgroundColor: column.isFestivity
                ? "var(--festivity-color)"
                : "var(--header-color)",
            }}
            key={column.key}
            colSpan={
              subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1 // +1 for Total column
                : 1
            }
          >
            {column.isMonthlyTotal ? (
              <>Total del mes</>
            ) : (
              <>Día {getDayNumberFrom(column.key)}</>
            )}
          </td>
        ))}
      </tr>
      {subcolumnsStructure && (
        <tr className="subcolumnsRow">
          <td></td>
          {columns.map((column) => (
            <Fragment key={column.key}>
              {Object.keys(subcolumnsStructure).map((key) => (
                <td key={`${column.key}-${key}`}>{key}</td>
              ))}
              <td key={`${column.key}-total`}>
                {" "}
                <strong>Total</strong>
              </td>
            </Fragment>
          ))}
        </tr>
      )}
    </>
  );
}
