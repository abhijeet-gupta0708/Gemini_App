import { useCallback, useEffect, useRef, useState } from "react";
import { copyText } from "./clipboard";

/**
 * Copies text to the clipboard and exposes a short-lived "copied" flag so
 * buttons can confirm the action without a global toast.
 */
export function useCopy(resetAfter = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text) => {
      const ok = await copyText(text);
      if (!ok) return false;

      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetAfter);
      return true;
    },
    [resetAfter]
  );

  return [copied, copy];
}
