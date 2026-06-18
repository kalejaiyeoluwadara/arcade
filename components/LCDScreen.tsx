import type { ReactNode, RefObject } from "react";
import type { GridConfig } from "@/lib/engine/types";

export default function LCDScreen({
  grid,
  canvasRef,
  overlay,
  children,
}: {
  grid: GridConfig;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  overlay?: ReactNode;
  children?: ReactNode;
}) {
  const width = grid.cols * grid.cell;
  const height = grid.rows * grid.cell;

  return (
    <div className="device__screen">
      <span className="screen-bolt screen-bolt--l" aria-hidden />
      <span className="screen-bolt screen-bolt--r" aria-hidden />
      <div className="screen-inner">
        <div className="lcd__playfield">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="lcd__canvas"
          />
          {overlay ? <div className="lcd__overlay">{overlay}</div> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
