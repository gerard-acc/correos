import "./detailsCommentModal.css";
import { Modal } from "../../layout/modal/Modal";
import Button from "../../common/button/Button";
import { useSpecificModal } from "../../../store/modalStore";

interface DetailsCommentData extends Record<string, unknown> {
  selectedClient: string;
  selectedWeek: string;
  comment: string;
}


export default function DetailsCommentModal() {
  const detailsCommentModal = useSpecificModal<DetailsCommentData>("details-comment");
  const { close, data } = detailsCommentModal;
  console.log(typeof(data))
  console.log(data)
 

  return (
    <Modal
      id="details-comment"
      title="Ver comentario"
      footer={
        <> 
          <Button 
            text="Cancelar" 
            border={false} 
            onClick={() => close()}
            />
          <Button
            text="Aceptar"
            filled={true}
            onClick={() => close()}
          />
        </>
      }
    >
      <div className="detailsCommentContent">
        <p className="detailsCommentModal-client">{ data?.selectedClient}</p>
        <div className="detailsCommentModal-weekWrapper">
          <p className="detailsCommentModal-title">Semana</p>
            <p className="detailsCommentModal-selectedWeek">{data?.selectedWeek} </p>
        </div>
        <div className="detailsCommentModal-commentWrapper">
          <p className="detailsCommentModal-comment-label">Comentario</p>
          <p className="detailsCommentModal-comment">{data?.comment} </p>
        </div>
      </div>
    </Modal>
  );
}
