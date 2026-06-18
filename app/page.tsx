import Link from "next/link";

const GAMES = [
  { href: "/shooting", name: "SPACE", icon: "↑" },
  { href: "/tank", name: "TANK", icon: "▲" },
  { href: "/fill-shot", name: "FILL", icon: "▣" },
];

export default function Home() {
  return (
    <main className="page">
      <div className="shell menu">
        <div className="shell__brand">
          <span>BRICK SHOOTER</span>
          <small>9999 in 1</small>
        </div>

        <nav className="menu__list">
          {GAMES.map((game) => (
            <Link key={game.href} href={game.href} className="menu__item">
              <span>{game.name}</span>
              <span aria-hidden>{game.icon}</span>
            </Link>
          ))}
        </nav>

        <p className="menu__hint">
          SELECT A GAME
          <br />
          ◄ ► MOVE · SPACE FIRE · ENTER START
        </p>
      </div>
    </main>
  );
}
