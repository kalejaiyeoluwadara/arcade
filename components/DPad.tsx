"use client";

import type { Direction, InputAction } from "@/lib/engine/types";

export default function DPad({
  press,
  release,
}: {
  press: (action: InputAction) => void;
  release: (action: InputAction) => void;
}) {
  const bind = (dir: Direction) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      press(dir);
    },
    onPointerUp: () => release(dir),
    onPointerLeave: () => release(dir),
    onPointerCancel: () => release(dir),
  });

  return (
    <div className="dpad" role="group" aria-label="D-pad">
      <button type="button" className="dpad__btn dpad__up" aria-label="Up" {...bind("up")}>
        ▲
      </button>
      <button type="button" className="dpad__btn dpad__left" aria-label="Left" {...bind("left")}>
        ◄
      </button>
      <div className="dpad__btn dpad__center" aria-hidden />
      <button type="button" className="dpad__btn dpad__right" aria-label="Right" {...bind("right")}>
        ►
      </button>
      <button type="button" className="dpad__btn dpad__down" aria-label="Down" {...bind("down")}>
        ▼
      </button>
    </div>
  );
}
