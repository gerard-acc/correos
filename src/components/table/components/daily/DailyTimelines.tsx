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
            key={column.day}
            colSpan={
              subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1 // +1 for Total column
                : 1
            }
          >
            Día {getDayNumberFrom(column.day)}
          </td>
        ))}
      </tr>
      {subcolumnsStructure && (
        <tr className="subcolumnsRow">
          <td></td>
          {columns.map((column) => (
            <Fragment key={column.day}>
              {Object.keys(subcolumnsStructure).map((key) => (
                <td key={`${column.day}-${key}`}>{key}</td>
              ))}
              <td key={`${column.day}-total`}>
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
