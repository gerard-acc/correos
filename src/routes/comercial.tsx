import CenteredContent from "../components/layout/CenteredContent";
import Table from "../components/table/Table";
import { createFileRoute } from "@tanstack/react-router";
import test_data from "../../public/test_data_2.json";
import Section from "../components/layout/Section";
import TableFooter from "../components/table/TableFooter";
import Chart from "../components/chart/Chart";
import Selector from "../components/common/selector/Selector";
import DateRange from "../components/common/dateRange/DateRange";
import Button from "../components/common/button/Button";
import Breadcrumb from "../components/common/breadcrumb/Breadcrumb";

export const Route = createFileRoute("/comercial")({
  component: Index,
});

function Index() {
  const styles: { [key: string]: React.CSSProperties } = {
    filters: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid var(--accent-color)",
      padding: "2rem 0",
      overflowY: "scroll",
      gap: "24px",
    },
    filters__block: {
      display: "flex",
      gap: "24px",
      alignItems: "center",
    },
  };
  return (
    <>
      <CenteredContent>
        <Breadcrumb
          pages={[{ label: "Inicio", link: "/" }, { label: "Comercial" }]}
        ></Breadcrumb>
        <section style={styles.filters}>
          <div style={styles.filters__block}>
            <Selector
              placeholder="Cliente"
              options={[
                { id: "op1", label: "Op 1" },
                { id: "op2", label: "Opcion largaaaa" },
              ]}
              type="rounded"
            ></Selector>
            <Selector
              placeholder="Zona"
              options={[{ id: "op1", label: "Op 1" }]}
              type="rounded"
            ></Selector>
            <Selector
              placeholder="Gestor"
              options={[{ id: "op1", label: "Op 1" }]}
              type="rounded"
            ></Selector>
          </div>
          <div style={styles.filters__block}>
            <Selector
              placeholder="Diario"
              options={[{ id: "op1", label: "Op 1" }]}
            ></Selector>
            <DateRange></DateRange>
            <Button
              filled={true}
              text="Filtrar"
              onClick={() => alert("filtrar")}
            ></Button>
          </div>
        </section>
        <Section>
          <h1>Forecast</h1>
          <Table periods="daily" data={test_data.regular} />
          <TableFooter></TableFooter>
        </Section>
        <Section>
          <h1>Gráfica</h1>
          <Chart></Chart>
        </Section>
      </CenteredContent>
    </>
  );
}

export default Index;
