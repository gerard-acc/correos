import { useState } from "react";
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

import dataFromBackend from "../../src/dataFromBackend.json"
import MultiRadius from "../components/common/multiRadius/MultiRadius";
import type { TableProps } from "../components/table/interfaces";
import ShowMoreFilters from "../components/common/showMoreFilters/ShowMoreFilters";

import "./comercial.css"

export const Route = createFileRoute("/comercial")({
  component: Index,
});

function Index() {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  
  // const styles: { [key: string]: React.CSSProperties } = {
  //   section_wrapper: {
  //     display: "flex",
  //     flexDirection: "row",
  //     width: "100%",
  //     justifyContent: "space-between",
  //     borderBottom: "1px solid gray",
  //     paddingBottom: "12px"
  //   },
  //   all_filters: {
  //     display: "flex",
  //     flexDirection: "column",
  //     justifyContent: "start",
  //     alignItems: "center"
  //   },
  //   default_filters: {
  //    display: "flex",
  //     width: "100%",
  //     alignItems: "center",
  //     padding: "1rem 0",
  //     gap: "20px",
  //   },
  //   more_filters: {
  //     display: "flex",
  //     width: "100%",
  //     justifyContent: "space-between",
  //     alignItems: "start",
  //     padding: "2rem 0",
  //     gap: "20px",
  //   },
  //   filter_wrapper_button: {
  //     display: "flex",
  //     justifyContent: "center",
  //     alignItems: "center",
  //     padding: "10px",
  //     borderLeft: "1px solid var(--accent-color)",
  //   }
  // };

  const [currentPeriod, setCurrentPeriod] =
    useState<TableProps["currentPeriod"]>("daily");


  return (
    <>
      <CenteredContent>
        <Breadcrumb
          pages={[{ label: "Inicio", link: "/" }, { label: "Comercial" }]}
        />

{/*////////////// FILTROS //////////////*/}
        <section id="comercial-section-filters" className="section_wrapper">
          <div className="all_filters">

 
              <div className="default_filters">
                    <Selector
                      placeholder="Cliente"
                      options={dataFromBackend.clientsFromBackend}
                      type="rounded"
                    />
                    <Selector
                      placeholder="Zona"
                      options={[{ id: "op1", label: "Op 1" }]}
                      type="rounded"
                    />
                    <Selector
                      placeholder="Gestor"
                      options={[{ id: "op1", label: "Op 1" }]}
                      type="rounded"
                    />
            
                    {/*////////////// Vista: Diario / Semanal //////////////*/}
                    <MultiRadius
                        onChange={(id) => {setCurrentPeriod(id as TableProps["currentPeriod"])}}
                        title="Vista"
                        defaultLabel="daily"
                        labels={[
                          { id: "daily", name: "Diario" },
                          { id: "weekly", name: "Semanal" },
                        ]}
                    />
        
                    {/*////////////// Fecha Desde / Hasta //////////////*/}
                    <DateRange/>
                    <ShowMoreFilters
                        showMoreFilters={showMoreFilters}
                        setShowMoreFilters={setShowMoreFilters}
                    />
                </div>
              {/*////////////// More Filters //////////////*/}
              { showMoreFilters &&
                  <div className="more_filters">
                      <Selector
                        placeholder="Unidad"
                        options={[{ id: "op1", label: "Op 1" }]}
                        type="rounded"
                      />
                      <Selector
                        placeholder="Unidad de gestión"
                        options={[{ id: "op1", label: "Op 1" }]}
                        type="rounded"
                      />
                      <Selector
                        placeholder="Canal"
                        options={[{ id: "op1", label: "Op 1" }]}
                        type="rounded"
                      />
                          <Selector
                        placeholder="Subcanal"
                        options={dataFromBackend.clientsFromBackend}
                        type="rounded"
                      />
                      <Selector
                        placeholder="Responsable de nivel"
                        options={[{ id: "op1", label: "Op 1" }]}
                        type="rounded"
                      />
                      <Selector
                        placeholder="Familia"
                        options={[{ id: "op1", label: "Op 1" }]}
                        type="rounded"
                      />
                      <Selector
                        placeholder="Producto"
                        options={[{ id: "op1", label: "Op 1" }]}
                        type="rounded"
                      />
                  </div>
              }
          </div>
            {/*////////////// Boton Filtrar //////////////*/}
            <div className="filter_wrapper_button">
              <Button
                filled={true}
                text="Filtrar"
                onClick={() => alert("filtrar")}
              />

            </div>
        </section>

{/*////////////// TABLA //////////////*/}
        <Section>
          <h1>Forecast</h1>
          <Table 
            route="comercial"
            data={test_data.regular} 
            currentPeriod={currentPeriod}
            setCurrentPeriod={setCurrentPeriod}
          />
          <TableFooter></TableFooter>
        </Section>

{/*////////////// GRAFICO //////////////*/}
        <Section>
          <h1>Gráfica</h1>
          <Chart></Chart>
        </Section>
      </CenteredContent>
    </>
  );
}

export default Index;
