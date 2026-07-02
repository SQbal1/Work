import type { ReactNode } from "react";

export function HomeMotionRoot({ children }: { children: ReactNode }) {
  return (
    <div className="home-page relative isolate overflow-x-clip bg-ink text-bone">
      <div className="home-motion-content relative z-10">{children}</div>
    </div>
  );
}
