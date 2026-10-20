import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

// Commit static SVG paths before the browser freezes layout for its print snapshot.
export default function usePrintMode() {
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('print');
    const before = () => flushSync(() => setPrinting(true));
    const after = () => flushSync(() => setPrinting(false));
    const change = event => event.matches ? before() : after();
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    media.addEventListener('change', change);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
      media.removeEventListener('change', change);
    };
  }, []);
  return printing;
}
