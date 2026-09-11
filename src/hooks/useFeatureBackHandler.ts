import { useEffect, DependencyList } from "react";
import { pushFeatureBackHandler } from "../navigation/featureBackHandler";

/** Android hardware back: unwind one nested level at a time. */
export function useFeatureBackHandler(
  handler: () => boolean,
  deps: DependencyList,
): void {
  useEffect(() => {
    return pushFeatureBackHandler(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
