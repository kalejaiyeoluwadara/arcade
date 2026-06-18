"use client";

import type { Direction, InputAction } from "@/lib/engine/types";

// White moulded cross D-pad, like the classic Brick Game.
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
    <div className="dpad-cross" role="group" aria-label="D-pad">
      <span className="dpad-cross__lbl dpad-cross__lbl--up">UP</span>
      <span className="dpad-cross__lbl dpad-cross__lbl--left">LEFT</span>
      <span className="dpad-cross__lbl dpad-cross__lbl--right">RIGHT</span>
      <span className="dpad-cross__lbl dpad-cross__lbl--down">DOWN</span>

      <div className="dpad-cross__grid">
        <button type="button" className="dpad-cross__arm dpad-cross__up" aria-label="Up" {...bind("up")} />
        <button type="button" className="dpad-cross__arm dpad-cross__left" aria-label="Left" {...bind("left")} />
        <span className="dpad-cross__hub" aria-hidden />
        <button type="button" className="dpad-cross__arm dpad-cross__right" aria-label="Right" {...bind("right")} />
        <button type="button" className="dpad-cross__arm dpad-cross__down" aria-label="Down" {...bind("down")} />
      </div>
    </div>
  );
}
