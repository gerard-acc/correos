import { Link } from "@tanstack/react-router";
import "./breadcrumb.css";

interface Page {
  label: string;
  link?: string;
}

export default function Breadcrumb({ pages }: { pages: Page[] }) {
  return (
    <div className="breadcrumb">
      {pages.map((page, index) =>
        page.link ? (
          <div className="breadcrumb__label" key={`${page.label}-${index}`}>
            <Link to={`${page.link}`} className="breacrumb__text">
              {page.label}
            </Link>
            <img src="/arrow_right.svg" width="5"></img>
          </div>
        ) : (
          <p key={`${page.label}-${index}`} className="breacrumb__text">
            {page.label}
          </p>
        ),
      )}
    </div>
  );
}
