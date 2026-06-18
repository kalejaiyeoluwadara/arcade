"use client";

import type { InputAction } from "@/lib/engine/types";

// The two large round buttons. Both fire (ROTATE doubles as the action button on
// the original device for non-Tetris games).
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
    <div className="device__act">
      <button type="button" className="btn3d btn3d--lg" aria-label="Fire" {...fire} />
      <span className="ctl">
        <button type="button" className="btn3d btn3d--lg" aria-label="Rotate / Fire" {...fire} />
        <span className="ctl__label">ROTATE</span>
      </span>
    </div>
  );
}
