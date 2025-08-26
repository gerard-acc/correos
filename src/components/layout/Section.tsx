import type { CSSProperties, PropsWithChildren } from "react";

const centeredContent: CSSProperties = {
  padding: "40px 0",
};

export default function Section({ children }: PropsWithChildren) {
  return <section style={centeredContent}>{children}</section>;
}
