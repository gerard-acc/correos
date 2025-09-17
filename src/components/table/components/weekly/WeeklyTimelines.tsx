import { useMemo } from "react";
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";

interface WeeklyTimelinesProps {
  weeksMap: { [week: number]: string[] };
  weekKeys: number[];
  subcolumnsStructure?: { [key: string]: number };
}

export default function WeeklyTimelines({
  weeksMap,
  weekKeys,
  subcolumnsStructure,
}: WeeklyTimelinesProps) {
  const monthGroups = useMemo(() => {
    const order: string[] = [];
    const map: {
      [key: string]: {
        monthNum: number;
        monthName: string;
        year: number;
        weeks: number;
      };
    } = {};
    weekKeys.forEach((week) => {
      const days = weeksMap[week] || [];
      if (days.length === 0) return;
      const first = days[0];
      const date = parse(first, "dd/MM/yyyy", new Date());
      const monthNum = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${monthNum}/${year}`;
      if (!map[key]) {
        map[key] = {
          monthNum,
          monthName: format(new Date(year, monthNum - 1), "MMMM", {
            locale: es,
          }),
          year,
          weeks: 0,
        };
        order.push(key);
      }
      map[key].weeks += 1;
    });
    return order.map((k) => ({ key: k, ...map[k] }));
  }, [weekKeys, weeksMap]);

  return (
    <>
      <tr className="monthRow">
        <td></td>
        {monthGroups.map((m) => (
          <td
            key={`month-${m.key}`}
            colSpan={
              m.weeks *
              (subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1
                : 1)
            }
          >
            {m.monthName}
          </td>
        ))}
      </tr>
      <tr className="weekRow">
        <td></td>
        {weekKeys.map((week) => (
          <td
            key={`week-${week}`}
            colSpan={
              subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1
                : 1
            }
          >
            S{week}
          </td>
        ))}
      </tr>
      {subcolumnsStructure && (
        <tr className="subcolumnsRow">
          <td></td>
          {weekKeys.map((week) => (
            <>
              {Object.keys(subcolumnsStructure).map((key) => (
                <td key={`week-${week}-${key}`}>{key}</td>
              ))}
              <td key={`week-${week}-total`}>
                <strong>Total</strong>
              </td>
            </>
          ))}
        </tr>
      )}
    </>
  );
}
