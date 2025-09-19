import "./table.css";
import { useEffect, useState, useMemo, Fragment } from "react";
import type {
  ColumnStructure,
  RowStructure,
  SubColumn,
  TableProps,
} from "./interfaces";
import { buildRows, buildColumns, groupDaysByWeek } from "./utils";
import MultiRadius from "../common/multiRadius/MultiRadius";
import MultiButton from "../common/multiButton/MultiButton";
import WeeklyTimelines from "./components/weekly/WeeklyTimelines";
import DailyTimelines from "./components/daily/DailyTimelines";
import TableFirstCol from "./components/TableFirstCol";
import Button from "../common/button/Button";
import TableTotalRows from "./components/TableTotalRows";
import TableTimelines from "./components/daily/TableTimelines";
import TableCell from "./components/daily/TableCell";
import TableTotalCell from "./components/daily/TableTotalCell";
import WeeklySubcolumnsGroup from "./components/weekly/WeeklySubcolumnsGroup";
import WeeklyTotalCell from "./components/weekly/WeeklyTotalCell";
import MonthlySubcolumnsGroup from "./components/daily/MonthlySubcolumnsGroup";
import MonthlyTotalCell from "./components/daily/MonthlyTotalCell";

export default function Table({ data, periods }: TableProps) {
  /**
   * La tabla recibe los datos (que seguramente tendremos que adaptar porque el back no nos los va a mandar
   * exactamente como es optimo para la tabla), y si mostramos vista semanal o diaria
   * El funcionamiento básico es que, con la data, generamos todas las columnas necesarias por un lado y todas las filas por otro, usamos esto
   * para pintar la "forma" de la tabla, y luego en cada celda vemos el valor que le corresponde.
   *
   * El valor de la celda viene en data, queda guardado en el objeto rows y ya está. El tema es que este valor lo puede modificar el usuario y verificar
   * otro usuario. Cuando un usuario modifica una celda, esta info queda guardada también en el objeto rows - Hacer un consolelog de rows para entender bien -
   * El objeto rows, que de base tiene un rowData con el valor de cada dia, pasa a tener tambien customValues y verifiedData creo, para guardar el valor inicial y las modificaciones
   */

  // isVerifying define si la tabla está siendo verificada o no.Cuando está siendo verificada, pulsar una celda manda algo al backend para indicarlo, y si se verifica correctamente la pintamos de verde
  // Cuando no está siendo verificada, pulsar la celda permite editar el valor. Un valor editado aparece verde y en cursiva
  const [isVerifying, setIsVerifying] = useState(false);

  // currentPeriod guarda si vemos la tabla en weekly o daily. Las vista daily es la base, la weekly usa la misma data pero sumando todos los valores
  // en la weekly no permite editar los valores de las celdas porque si editamos en weekly y pasamos a daily no sé como deberia repartirlo o qué hacer.
  // Me preocupa que al final el back sea quien lo mande por semanas directamente, porque significaria cambiar bastantes cosas, pero puede que solo sea
  // borrar todos los componentes semanales y adaptar un poco como leemos la data para construir rows y cols en caso de recibir los datos semanales.
  const [currentPeriod, setCurrentPeriod] =
    useState<TableProps["periods"]>(periods);

  // Se construyen las columnas, aquí ningún problema, hay complejidad en buildColumns pero no es terrible
  const columns = useMemo<ColumnStructure[]>(() => buildColumns(data), [data]);

  // Se construyen las rows en un useEffect mas abajo, no es un useMemo igual que columns porque necesitamos
  // el setRows para cuando cambian valores de alguna row, que refresque todo para los calculos de las celdas que suman cosas
  const [rows, setRows] = useState<RowStructure[]>([]);

  // expandedParents guarda un set de las filas que estan expandidas, se usa para mostrar/esconder filas y subfilas mas abajo
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );

  // En subColumnsStructure simplemente guardamos las subcolumnas que pueden tener los dias en algunas tablas
  // Por supuesto todos los dias deben tener las mismas subcolumnas, porque aquí cogemos las del primer dia confiando en que
  // todos los demás son iguales.
  const subColumnsStructure = useMemo<SubColumn | undefined>(() => {
    return columns[0]?.subColumns;
  }, [columns]);

  // weeksMap guarda los grupos de semanas, es decir el número de semana y los dias que tiene
  const weeksMap = useMemo<{ [week: number]: string[] }>(
    () => groupDaysByWeek(data),
    [data],
  );

  // visibleRows se usa solamente para tener las rows visibles. Parece mas complejo de lo que deberia, pero creo que es necesario
  // que sea asi para casos de filas que son padres e hijas a la vez por ejemplo. Usa expandedParents para saber qué filtrar y qué no.
  // visibleRows es lo que finalmente usamos en la tabla para pintar las filas. Tiene la misma info que rows pero filtrado, sin mas.
  const visibleRows = useMemo(() => {
    return rows.filter((row: RowStructure): boolean => {
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
  }, [rows, expandedParents]);

  // Funcion para setear una fila como extendida o no y por tanto que se recalculen las visibleRows
  const toggleParent = (toggledParent: string) => {
    setExpandedParents((prev) => {
      const expandedParents = new Set(prev);
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
    });
  };

  useEffect(() => {
    setRows(buildRows(data));
  }, [data]);

  useEffect(() => {
    setCurrentPeriod(periods);
  }, [periods]);

  return (
    <>
      <div className="tableOptions">
        <MultiRadius
          onChange={(id) => setIsVerifying(id === "verificar")}
          title="Modo"
          defaultLabel="editar"
          labels={[
            { id: "verificar", name: "Verificar" },
            { id: "editar", name: "Editar" },
          ]}
        ></MultiRadius>
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
            {/* En el thead tenemos los componentes de Timelines (se llaman así porque antes (la semana pasada xd) tenia 3 o 4 filas, ahora solo tiene una pero 
            almenos sigue siendo un timeline).
            Dentro de las timelines se calcula el span de las td para que se extienda todo lo que dura el mes o la semana,
            se pone la fila de los dias y en caso de que haya subcolumnas se ponen también aquí */}
            {currentPeriod === "daily" ? (
              <>
                <TableTimelines columns={columns} />
                <DailyTimelines
                  data={data}
                  columns={columns}
                  rows={rows}
                  subcolumnsStructure={subColumnsStructure}
                />
              </>
            ) : (
              <WeeklyTimelines
                weeksMap={weeksMap}
                subcolumnsStructure={subColumnsStructure}
              />
            )}
          </thead>
          <tbody>
            {/* En el tbody pintamos las celdas por supuesto. Lo pintamos a partir de las visibleRows, se pinta como padre o hijo gracias a que las rows
            tienen la info de si es padre o hijo y el nivel.
             */}
            {visibleRows.map((row, index) => (
              <tr
                key={row.key ?? `${row.name}-${index}`}
                className={`level-${row.level} ${row.type}`}
              >
                {/* La primera columna siempre es el nombre y tiene el evento de plegar o desplegar si es padre */}
                <TableFirstCol
                  row={row}
                  expandedParents={expandedParents}
                  onToggle={toggleParent}
                ></TableFirstCol>

                {/* A partir de aquí se pintan todas las celdas de la fila
                La complejidad está en las filas con subcolumnas, que deben pintar una columna para cada subcolumna de cada dia + la columna de Total */}
                {currentPeriod === "daily"
                  ? columns.map((column, colIndex) =>
                      subColumnsStructure ? (
                        // En caso de tener subcolumnas, pintamos una cell para cada una, y la TableTotalCell es la que pinta el total de las subcolumnas
                        <Fragment key={column.key}>
                          {column.isMonthlyTotal ? (
                            <MonthlySubcolumnsGroup
                              columns={columns}
                              totalColumnIndex={colIndex}
                              row={row}
                              allRows={rows}
                              subKeys={Object.keys(subColumnsStructure)}
                              groupKey={`month-${column.key}`}
                            />
                          ) : (
                            <>
                              {Object.keys(subColumnsStructure).map((key) => (
                                <TableCell
                                  key={`${column.key}-${key}-${index}`}
                                  index={index}
                                  column={column}
                                  row={row}
                                  isVerifying={isVerifying}
                                  rows={rows}
                                  subColumn={key}
                                  updateRows={() => setRows([...rows])}
                                />
                              ))}
                              {/* A la TableTotalCell le pasamos lo que necesita para hacer los calculos, es decir los customValues y sus filas hijas */}
                              <TableTotalCell
                                day={column.key}
                                overrideForDay={
                                  row.customValues?.[column.key] as SubColumn
                                }
                                baseSubcolumnsForDay={
                                  row.rowData?.[column.key] as SubColumn
                                }
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
                                subKeys={Object.keys(subColumnsStructure)}
                              />
                            </>
                          )}
                        </Fragment>
                      ) : // Si no hay subcolumnas es así de simple
                      column.isMonthlyTotal ? (
                        <MonthlyTotalCell
                          cellKey={`month-${column.key}`}
                          columns={columns}
                          totalColumnIndex={colIndex}
                          row={row}
                          allRows={rows}
                        />
                      ) : (
                        <TableCell
                          key={`${column.key}-${index}`}
                          index={index}
                          column={column}
                          row={row}
                          isVerifying={isVerifying}
                          rows={rows}
                          updateRows={() => setRows([...rows])}
                        />
                      ),
                    )
                  : Object.keys(weeksMap).map((week) => {
                      const numericWeek = parseInt(week);
                      const days = weeksMap[numericWeek] || [];
                      return subColumnsStructure ? (
                        <WeeklySubcolumnsGroup
                          key={`group-${week}`}
                          week={numericWeek}
                          days={days}
                          row={row}
                          allRows={rows}
                          subKeys={Object.keys(subColumnsStructure || {})}
                        />
                      ) : (
                        <WeeklyTotalCell
                          key={`total-${week}`}
                          week={numericWeek}
                          days={days}
                          row={row}
                          allRows={rows}
                        />
                      );
                    })}
              </tr>
            ))}
            {/* Finalmente esto son las cuatro filas de totales que hay debajo de la tabla, no está del todo definido así que por ahora
            solo rellena la fila de Total básico. Si el total modificadas necesita un total de lo que el usuario ha estado tocando, se puede
            usar tranquilamente el customValue del objeto rows por ejemplo.
            Se dice que habrá info del total de todos los datos, incluso los que no estan en la tabla, cuando haya back habrá que ver como se obtiene 

            Este tableTotalRows gestiona el daily y el weekly dentro pasandole el currentPeriod
            */}
            <TableTotalRows
              currentPeriod={currentPeriod}
              columns={columns}
              subcolumnsStructure={subColumnsStructure}
              rows={rows}
            ></TableTotalRows>
          </tbody>
        </table>
      </div>
    </>
  );
}
