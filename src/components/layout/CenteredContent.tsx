import type { CSSProperties, PropsWithChildren } from "react";

const centeredContent: CSSProperties = {
  padding: "0 40px",
};

export default function CenteredContent({ children }: PropsWithChildren) {
  return <div style={centeredContent}>{children}</div>;
}
