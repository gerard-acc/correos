import type { CSSProperties } from "react";

interface Banner {
  title: string;
  text: string;
}

const banner: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "40px 195px",
  backgroundColor: "var(--gray)",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

export default function Banner({ title, text }: Banner) {
  return (
    <div style={banner}>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
