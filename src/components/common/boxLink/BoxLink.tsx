import "./boxLink.css";

interface BoxLink {
  title: string;
  icon: string;
}

export default function BoxLink({ title, icon }: BoxLink) {
  return (
    <div className="boxLink">
      <img src={icon}></img>
      <h3>{title}</h3>
    </div>
  );
}
