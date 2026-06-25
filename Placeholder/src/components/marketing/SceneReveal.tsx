import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

export function SceneReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  distance?: number;
  rotate?: number;
  scaleFrom?: number;
}) {
  return <div className={className}>{children}</div>;
}

export function SceneLine({
  className,
}: {
  className?: string;
  axis?: "x" | "y";
  delay?: number;
}) {
  return <span aria-hidden="true" className={className} />;
}
