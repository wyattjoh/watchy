import { createStore, type SnapshotFromStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";

export const store = createStore({
  context: { dev: false },
  on: {
    toggleDev: (context) => ({
      dev: !context.dev,
    }),
  },
});

type Store = typeof store;
type Selector<T> = (snapshot: SnapshotFromStore<Store>) => T;

export function useStore<T>(selector: Selector<T>): T {
  return useSelector(store, selector);
}
