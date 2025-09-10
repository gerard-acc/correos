import "./table.css";
import { useEffect, useState, useMemo } from "react";
import type {
  ColumnStructure,
  RowStructure,
  SubColumn,
  TableProps,
} from "./interfaces";
import {
  buildRows,
  getDayNumberFrom,
  buildColumns,
  getSubcolumnsStructure,
  groupDaysByWeek,
} from "./utils";
import Toggle from "../common/toggle/Toggle";
import MultiButton from "../common/multiButton/MultiButton";
import WeeklyTimelines from "./components/weekly/WeeklyTimelines";
import TableWeeklyCells from "./components/weekly/TableWeeklyCells";
import DailyTimelines from "./components/daily/DailyTimelines";
import TableDailyCells from "./components/daily/TableDailyCells";
import TableFirstCol from "./components/TableFirstCol";
import Button from "../common/button/Button";

export default function Table({ data, periods }: TableProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentPeriod, setCurrentPeriod] =
    useState<TableProps["periods"]>(periods);
  // columns and weeks are derived from data; keep rows as state for edits
  const columns = useMemo<ColumnStructure[]>(() => buildColumns(data), [data]);
  const [nestedRows, setNestedRows] = useState<RowStructure[]>([]);
  const weeksMap = useMemo<{ [week: number]: string[] }>(() => groupDaysByWeek(data), [data]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );
  const weekKeys = useMemo(
    () =>
      Object.keys(weeksMap)
        .map((w) => parseInt(w, 10))
        .sort((a, b) => a - b),
    [weeksMap],
  );
  const subColumnsStructure = useMemo<SubColumn | undefined>(() => getSubcolumnsStructure(columns), [columns]);

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
    setNestedRows(buildRows(data));
  }, [data]);

  useEffect(() => {
    setCurrentPeriod(periods);
  }, [periods]);

  const toggleParent = (toggledParent: string) => {
    setExpandedParents((prev) => getNewExpandedParents(toggledParent, prev));
  };

  const getNewExpandedParents = (
    toggledParent: string,
    currentParents: Set<string>,
  ) => {
    const expandedParents = new Set(currentParents);
    if (expandedParents.has(toggledParent)) {
      expandedParents.delete(toggledParent);
      Array.from(expandedParents).forEach((expandedKey) => {
        if (expandedKey.startsWith(toggledParent + "|")) {
          expandedParents.delete(expandedKey);
        }
      });
    } else {
      expandedParents.add(toggledParent);
    }

    return expandedParents;
  };

  return (
    <>
      <div className="tableOptions">
        <Toggle
          onChange={(status) => setIsVerifying(status)}
          label="Verificar"
        ></Toggle>
        <MultiButton
          buttons={[
            { id: "daily", label: "Diario" },
            { id: "weekly", label: "Semanal" },
          ]}
          onChange={(id) => setCurrentPeriod(id as TableProps["periods"])}
        ></MultiButton>
        <Button
          text="Descargar"
          onClick={() => console.log("Descargar")}
          icon="download.svg"
          border={false}
        ></Button>
      </div>
      <div className="tableContainer">
        <table>
          <thead>
            {currentPeriod === "daily" ? (
              <DailyTimelines
                data={data}
                columns={columns}
                nestedRows={nestedRows}
                subcolumnsStructure={subColumnsStructure}
                getDayNumberFrom={getDayNumberFrom}
              />
            ) : (
              <WeeklyTimelines
                weeksMap={weeksMap}
                weekKeys={weekKeys}
                subcolumnsStructure={subColumnsStructure}
                nestedRows={nestedRows}
                columns={columns}
              />
            )}
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={row.key ?? `${row.name}-${index}`}
                className={`level-${row.level} ${row.type}`}
              >
                <TableFirstCol
                  row={row}
                  expandedParents={expandedParents}
                  onToggle={toggleParent}
                ></TableFirstCol>

                {currentPeriod === "daily" ? (
                  <TableDailyCells
                    row={row}
                    columns={columns}
                    subcolumnsStructure={subColumnsStructure}
                    isVerifying={isVerifying}
                    visibleRows={visibleRows}
                    nestedRows={nestedRows}
                    rowIndex={index}
                    onUpdateRows={() => setNestedRows([...nestedRows])}
                  />
                ) : (
                  <TableWeeklyCells
                    row={row}
                    weekKeys={weekKeys}
                    weeksMap={weeksMap}
                    subcolumnsStructure={subColumnsStructure}
                    nestedRows={nestedRows}
                  />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
