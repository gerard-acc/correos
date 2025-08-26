import { Link } from "@tanstack/react-router";
import "./breadcrumb.css";

interface Page {
  label: string;
  link?: string;
}

export default function Breadcrumb({ pages }: { pages: Page[] }) {
  return (
    <div className="breadcrumb">
      {pages.map((page) =>
        page.link ? (
          <>
            <Link to={`${page.link}`} className="breacrumb__text">
              {page.label}
            </Link>
            <img src="/arrow_right.svg" width="5"></img>
          </>
        ) : (
          <p className="breacrumb__text">{page.label}</p>
        ),
      )}
    </div>
  );
}
