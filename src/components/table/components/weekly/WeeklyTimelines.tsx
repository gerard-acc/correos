import { useMemo } from "react";
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";
import { useGlobalStore } from "../../../../store/global.store";
import iconComment from "../../../../../public/comment_yellow.svg"
import { useSpecificModal } from "../../../../store/modalStore";
import DetailsCommentModal from "../../modals/detailsCommentModal";
interface WeeklyTimelinesProps {
  weeksMap: { [week: number]: string[] };
  weekKeys: number[];
  subcolumnsStructure?: { [key: string]: number };
}

interface Comment  {
    selectedClient: string,
    comment: string,
    selectedWeek: string
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

  const comments = useGlobalStore(state => state.comments)
  const detailsCommentModal = useSpecificModal("details-comment");


  // console.log({comments})
  console.log({weekKeys})

  console.log("Renderizado")

const hasCommentInThisWeek = (comments : Comment[], weekNumber: number) =>
  comments.some((comment) => comment.selectedWeek.includes(String(weekNumber)))

const handleSeeDetailsComment = (comments : Comment[], weekNumber: number) => {
  const commentToSee = comments.filter(comment => comment.selectedWeek.includes(String(weekNumber)))[0]
  
  detailsCommentModal.open(commentToSee)


}

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
           <span
              style={{color: "black", fontSize: "16px", lineHeight: "20px" ,fontWeight: "bold", paddingRight: "12px"}}
           > 
              S{week}
           </span> 

            <span
               style={{color: "black", fontSize: "12px", backgroundColor: "#F0F3F6", padding: "4px 12px 4px 12px", borderRadius: "12px", marginRight: "12px"}}
            >
              {weeksMap[week][0]} - {weeksMap[week][weeksMap[week].length -1] }
            </span>

            <span
               style={{color: "black", fontSize: "12px", backgroundColor: "#F0F3F6", padding: "4px 12px 4px 12px", borderRadius: "12px" }}
            >
              {"Días laborables XX "}
            </span>

          </td>
          
        ))}
      </tr>
      {/*  Probando otra fila */}
      <tr className="weekNumberRow">
        <td></td>
        {weekKeys.map((week) => (
          <td
           style={{backgroundColor: "#002e6d"}}
            key={`week-${week}`}
            colSpan={
              subcolumnsStructure
                ? Object.keys(subcolumnsStructure).length + 1
                : 1
            }
          >
            <div
            style={{display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{ color: "white", fontSize: "16px", fontWeight: "500", paddingLeft: "12px"}}
            > 
                Semana {week} 
            </span> 
              { hasCommentInThisWeek(comments, week) && <img src={iconComment} onClick={() => handleSeeDetailsComment(comments, week)}/> }

            </div>
          </td>
          
        ))}
      </tr>
      {/*  Fin de Probando otra fila */}
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
      <DetailsCommentModal></DetailsCommentModal>
    </>
  );
}
