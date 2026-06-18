import type { ReactNode } from "react";

export default function HandheldShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <div className="shell__brand">
        <span>{title}</span>
        <small>9999 in 1</small>
      </div>
      {children}
    </div>
  );
}
