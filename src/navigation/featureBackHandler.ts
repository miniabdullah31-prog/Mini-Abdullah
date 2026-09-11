type FeatureBackFn = () => boolean;

const stack: FeatureBackFn[] = [];

/** Register a screen-level back handler (deepest screen wins first). */
export function pushFeatureBackHandler(fn: FeatureBackFn): () => void {
  stack.push(fn);
  return () => {
    const idx = stack.lastIndexOf(fn);
    if (idx >= 0) {
      stack.splice(idx, 1);
    }
  };
}

/** Try feature handlers innermost-first; false = pop to Home. */
export function tryFeatureBack(): boolean {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i]()) {
      return true;
    }
  }
  return false;
}
