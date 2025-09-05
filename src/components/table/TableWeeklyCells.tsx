import { Fragment } from "react";
import type { RowStructure } from "./interfaces";

interface TableWeeklyCellsProps {
  row: RowStructure;
  weekKeys: number[];
  weeksMap: { [week: number]: string[] };
  subcolumnsStructure?: { [key: string]: number };
  nestedRows: RowStructure[];
}

export default function TableWeeklyCells({
  row,
  weekKeys,
  weeksMap,
  subcolumnsStructure,
  nestedRows,
}: TableWeeklyCellsProps) {
  return (
    <>
      {weekKeys.map((week) => {
        const days = weeksMap[week] || [];
        if (subcolumnsStructure) {
          const subKeys = Object.keys(subcolumnsStructure);
          const values = subKeys.map((subKey) => {
            if (row.type === "child") {
              let sum = 0;
              days.forEach((d) => {
                const v = row.rowData?.[d];
                if (typeof v === "object" && v[subKey] !== undefined) {
                  sum += v[subKey];
                }
              });
              return sum;
            } else {
              const childRows = nestedRows.filter(
                (r) =>
                  r.type === "child" && r.parentKey && row.key && r.parentKey.startsWith(row.key),
              );
              let sum = 0;
              days.forEach((d) => {
                const override = row.customValues?.[d];
                if (override && typeof override === "object" && override[subKey] !== undefined) {
                  sum += override[subKey];
                } else {
                  childRows.forEach((child) => {
                    const v = child.rowData?.[d];
                    if (typeof v === "object" && v[subKey] !== undefined) {
                      sum += v[subKey];
                    }
                  });
                }
              });
              return sum;
            }
          });
          const total = values.reduce((a, b) => a + b, 0);
          return (
            <Fragment key={`week-${week}`}>
              {values.map((v, i) => (
                <td key={`week-${week}-sub-${subKeys[i]}`}>{v}</td>
              ))}
              <td key={`week-${week}-total`}>{total}</td>
            </Fragment>
          );
        } else {
          let total = 0;
          if (row.type === "child") {
            days.forEach((d) => {
              const v = row.rowData?.[d];
              if (typeof v === "number") total += v;
              else if (typeof v === "object")
                total += Object.values(v).reduce((s, n) => s + (n || 0), 0);
            });
          } else {
            const childRows = nestedRows.filter(
              (r) => r.type === "child" && r.parentKey && row.key && r.parentKey.startsWith(row.key),
            );
            days.forEach((d) => {
              const override = row.customValues?.[d];
              if (typeof override === "number") {
                total += override;
              } else {
                let dayTotal = 0;
                childRows.forEach((child) => {
                  const v = child.rowData?.[d];
                  if (typeof v === "number") dayTotal += v;
                  else if (typeof v === "object")
                    dayTotal += Object.values(v).reduce((s, n) => s + (n || 0), 0);
                });
                total += dayTotal;
              }
            });
          }
          return <td key={`week-${week}`}>{total}</td>;
        }
      })}
    </>
  );
}

