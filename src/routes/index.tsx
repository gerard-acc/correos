import { createFileRoute } from "@tanstack/react-router";
import Banner from "../components/layout/Banner";
import BoxLink from "../components/common/boxLink/BoxLink";
import business_center from "/business_center.svg";
import calculate from "/calculate.svg";
import graph_2 from "/graph_2.svg";
import chart_data from "/chart_data.svg";
import browse_activity from "/browse_activity.svg";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const links: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "60px",
  padding: "60px 0",
};

function Index() {
  return (
    <>
      <Banner title="Previsión de la demanda" text="Lorem ipsum"></Banner>
      <div style={links}>
        <Link to="/comercial">
          <BoxLink title="Comercial" icon={business_center}></BoxLink>
        </Link>
        <Link to="/operaciones">
          <BoxLink title="Operaciones" icon={calculate}></BoxLink>
        </Link>
        <Link to="/estrategia">
          <BoxLink title="Estrategia" icon={graph_2}></BoxLink>
        </Link>
        <Link to="/rendimiento">
          <BoxLink title="Rendimiento" icon={chart_data}></BoxLink>
        </Link>
        <Link to="/seguimiento">
          <BoxLink title="Seguimiento" icon={browse_activity}></BoxLink>
        </Link>
      </div>
    </>
  );
}

export default Index;
