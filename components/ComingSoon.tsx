import Link from "next/link";
import HandheldShell from "./HandheldShell";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className="page">
      <HandheldShell title="BRICK SHOOTER">
        <div className="lcd">
          <div className="lcd__inner" style={{ minHeight: 200 }}>
            <div
              className="lcd__overlay"
              style={{ position: "static", flex: 1 }}
            >
              <strong>{title}</strong>
              <span>COMING SOON</span>
            </div>
          </div>
        </div>
        <p className="menu__hint" style={{ marginTop: 16 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            ◄ BACK TO MENU
          </Link>
        </p>
      </HandheldShell>
    </main>
  );
}
