import type { ReactNode } from "react";

function CatMascot() {
  return (
    <svg className="cat" viewBox="0 0 64 64" aria-hidden>
      {/* tail */}
      <path d="M15 54 C3 51 7 36 18 41" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      {/* body + head */}
      <ellipse cx="34" cy="46" rx="16" ry="14" fill="#fff" stroke="#b88e00" strokeWidth="1.5" />
      <circle cx="34" cy="25" r="13" fill="#fff" stroke="#b88e00" strokeWidth="1.5" />
      {/* ears */}
      <polygon points="23,15 27,3 33,13" fill="#fff" stroke="#b88e00" strokeWidth="1.5" />
      <polygon points="45,15 41,3 35,13" fill="#fff" stroke="#b88e00" strokeWidth="1.5" />
      {/* face */}
      <circle cx="29" cy="24" r="1.7" fill="#2a2200" />
      <circle cx="39" cy="24" r="1.7" fill="#2a2200" />
      <path d="M32 28 q2 2.4 4 0" fill="none" stroke="#2a2200" strokeWidth="1" />
      <line x1="19" y1="26" x2="28" y2="27" stroke="#b88e00" strokeWidth="1" />
      <line x1="49" y1="26" x2="40" y2="27" stroke="#b88e00" strokeWidth="1" />
      {/* ball of yarn */}
      <circle cx="51" cy="52" r="6" fill="#fff" stroke="#b88e00" strokeWidth="1.5" />
      <path d="M46 52 h10 M51 47 v10 M47.5 48.5 l7 7 M54.5 48.5 l-7 7" stroke="#b88e00" strokeWidth="0.9" />
    </svg>
  );
}

export default function HandheldShell({ children }: { children: ReactNode }) {
  return (
    <div className="device">
      <div className="device__top">
        <span className="device__brand">Han Cheng</span>
      </div>

      {children}

      <div className="device__deco">
        <div className="device__deco-left">
          <CatMascot />
          <span className="device__nine">9999 IN 1</span>
        </div>
        <span className="device__brick">
          BRICK
          <br />
          GAME
        </span>
      </div>
    </div>
  );
}
