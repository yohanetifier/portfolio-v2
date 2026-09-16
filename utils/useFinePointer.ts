'use client';

import { useEffect, useState } from 'react';

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

export function useFinePointer() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER_QUERY);
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return fine;
}
