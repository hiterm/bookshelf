import { DependencyList, EffectCallback, useEffect } from "react";

// https://dev.to/rajeshroyal/how-to-make-a-custom-debounce-hook-in-react-js-4gcc
export const useDebouncedEffect = (
  effect: EffectCallback,
  deps: DependencyList,
  delay: number,
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps ?? []), delay]);
};
