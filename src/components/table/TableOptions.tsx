import Toggle from "../common/toggle/Toggle";

const tableOptions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "24px",
  padding: "40px 0",
};

export default function TableOptions() {
  return (
    <div style={tableOptions}>
      <Toggle label="Verificar"></Toggle>
      <button>Descargar</button>
    </div>
  );
}
