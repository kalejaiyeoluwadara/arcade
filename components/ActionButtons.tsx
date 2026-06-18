"use client";

import type { InputAction } from "@/lib/engine/types";

// A and B both fire (the device only ever has one projectile on screen).
export default function ActionButtons({
  press,
  release,
}: {
  press: (action: InputAction) => void;
  release: (action: InputAction) => void;
}) {
  const fire = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      press("fire");
    },
    onPointerUp: () => release("fire"),
    onPointerLeave: () => release("fire"),
    onPointerCancel: () => release("fire"),
  };

  return (
    <div className="actions">
      <button type="button" className="btn-round btn-round--b" aria-label="B (fire)" {...fire}>
        B
      </button>
      <button type="button" className="btn-round" aria-label="A (fire)" {...fire}>
        A
      </button>
    </div>
  );
}
