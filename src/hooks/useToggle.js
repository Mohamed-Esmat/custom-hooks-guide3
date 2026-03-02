import { useState } from "react";

/**
 * Very beginner-friendly toggle hook.
 * Keeps a boolean and gives you a function to flip it.
 * No useCallback optimization – just the basics.
 *
 * @param {boolean} [initial=false]
 * @returns {[boolean, () => void, (next:boolean)=>void]}
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(Boolean(initial));
  const toggle = () => setValue((v) => !v);
  return [value, toggle, setValue];
}

export default useToggle;
