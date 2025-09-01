import CenteredContent from "../components/layout/CenteredContent";
import Table from "../components/table/Table";
import { createFileRoute } from "@tanstack/react-router";
// import type { DataRow } from "../interfaces";
import test_data from "../../public/test_data_2.json";
import Section from "../components/layout/Section";
import TableFooter from "../components/table/TableFooter";
import Tabs from "../components/layout/tabs/Tabs";
import { useState } from "react";
import Breadcrumb from "../components/common/breadcrumb/Breadcrumb";
import Selector from "../components/common/selector/Selector";
import Checks from "../components/common/checks/Checks";
import MultiButton from "../components/common/multiButton/MultiButton";
import DateRange from "../components/common/dateRange/DateRange";

export const Route = createFileRoute("/operaciones")({
  component: Index,
});

function Index() {
  const [activeTab, setActiveTab] = useState("nacida");

  const tabs = [
    {
      id: "nacida",
      label: "Nacida",
      content: (
        <>
          <div className="filtersSection">
            <p>Características de producto</p>
            <div className="filtersRow">
              <Checks
                title="Ámbito"
                checks={[
                  { id: "nacional", label: "Nacional" },
                  { id: "exportacion", label: "Exportación" },
                  { id: "importacion", label: "Importación" },
                ]}
              ></Checks>
            </div>
            <div className="filtersRow">
              <Selector
                placeholder="Producto"
                type="rounded"
                options={[{ id: "ola", label: "ola" }]}
              ></Selector>
              <Selector
                placeholder="Canal"
                type="rounded"
                options={[{ id: "ola", label: "ola" }]}
              ></Selector>
            </div>
          </div>
          <div className="filtersSection">
            <p>Ámbito territorial</p>
            <div className="filtersRow">
              <MultiButton
                buttons={[
                  { id: "origen", label: "Origen" },
                  { id: "destino", label: "Destino" },
                ]}
              ></MultiButton>
            </div>
            <div className="filtersRow">
              <Selector
                placeholder="Área"
                type="rounded"
                options={[{ id: "ola", label: "ola" }]}
              ></Selector>
              <Selector
                placeholder="Centro"
                type="rounded"
                options={[{ id: "ola", label: "ola" }]}
              ></Selector>
              <Selector
                placeholder="Provincia"
                type="rounded"
                options={[{ id: "ola", label: "ola" }]}
              ></Selector>
              <Selector
                placeholder="Unidad"
                type="rounded"
                options={[{ id: "ola", label: "ola" }]}
              ></Selector>
              <Selector
                placeholder="Código Postal"
                type="rounded"
                options={[{ id: "ola", label: "ola" }]}
              ></Selector>
            </div>
          </div>
          <div className="filtersSection">
            <p>Ámbito temporal</p>
            <div className="filtersRow">
              <DateRange></DateRange>
            </div>
            <div className="filtersRow">
              <Checks
                title="Turnos"
                checks={[
                  { id: "si", label: "Sí" },
                  { id: "no", label: "No" },
                ]}
              ></Checks>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "distribuida",
      label: "Distribuida",
      content: <></>,
    },
    {
      id: "centros",
      label: "Centros",
      content: <></>,
    },
  ];

  return (
    <>
      <CenteredContent>
        <Breadcrumb
          pages={[{ label: "Inicio", link: "/" }, { label: "Operaciones" }]}
        ></Breadcrumb>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <Section>
          <h1>Forecast</h1>
          <Table periods="daily" data={test_data.regular} />
          <TableFooter></TableFooter>
        </Section>
      </CenteredContent>
    </>
  );
}

export default Index;
