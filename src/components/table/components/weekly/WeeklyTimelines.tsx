import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getWeekKeys } from "../../utils";

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
  const weekKeys = getWeekKeys(weeksMap);

  return (
    <tr className="timelineRow">
      <td></td>
      {weekKeys.map((week, index) => {
        const days = weeksMap[week] || [];
        const currentFirstDay = days[0];
        // Show month when the month changes compared to previous week's first day
        let showMonth = index === 0;
        if (!showMonth && index > 0) {
          const prevWeek = weekKeys[index - 1];
          const prevFirstDay = weeksMap[prevWeek]?.[0];
          if (prevFirstDay && currentFirstDay) {
            const [, currMonth, currYear] = currentFirstDay.split("/");
            const [, prevMonth, prevYear] = prevFirstDay.split("/");
            showMonth = currMonth !== prevMonth || currYear !== prevYear;
          }
        }

        const colSpan = subcolumnsStructure
          ? Object.keys(subcolumnsStructure).length + 1
          : 1;
        return (
          <td key={`week-${week}`} colSpan={colSpan}>
            {showMonth && currentFirstDay && (
              <MonthPill dayKey={currentFirstDay}></MonthPill>
            )}
            <WeekPill week={week}></WeekPill>
          </td>
        );
      })}
    </tr>
  );
}
