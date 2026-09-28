"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after the first client render — avoids SSR/hydration
 *  mismatches for libraries (Recharts) that measure the DOM. Implemented
 *  via useSyncExternalStore (server snapshot false, client snapshot true)
 *  rather than a mount-effect + setState, per React's hydration guidance. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
