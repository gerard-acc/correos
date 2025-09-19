import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WeeklyTimelinesProps {
  weeksMap: { [week: number]: string[] };
  subcolumnsStructure?: { [key: string]: number };
}

const MonthPill = ({ dayKey }: { dayKey: string }) => {
  const [, monthStr, yearStr] = dayKey.split("/");
  const monthNum = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);
  const monthName = format(new Date(year, monthNum - 1), "MMMM", {
    locale: es,
  });
  return <span className="headerPill headerPill--noFill">{monthName}</span>;
};

const WeekPill = ({ week }: { week: number | string }) => {
  return <span className="headerPill headerPill--noFill">S{week}</span>;
};

export default function WeeklyTimelines({
  weeksMap,
  subcolumnsStructure,
}: WeeklyTimelinesProps) {
  const weekKeys = Object.keys(weeksMap).map((w) => parseInt(w, 10));

  return (
    <tr className="timelineRow">
      <td></td>
      {weekKeys.map((week, index) => {
        const days = weeksMap[week] || [];
        const firstOfMonthDay = days.find((d) => d.startsWith("01/"));
        const showMonth = index === 0 || !!firstOfMonthDay;
        const colSpan = subcolumnsStructure
          ? Object.keys(subcolumnsStructure).length + 1
          : 1;
        return (
          <td key={`week-${week}`} colSpan={colSpan}>
            {showMonth && (
              <MonthPill dayKey={firstOfMonthDay || days[0]}></MonthPill>
            )}
            <WeekPill week={week}></WeekPill>
          </td>
        );
      })}
    </tr>
  );
}
