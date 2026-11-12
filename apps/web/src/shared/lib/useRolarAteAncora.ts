import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function useRolarAteAncora() {
  const { hash } = useLocation();

  useEffect(() => {
    const alvo = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    alvo?.scrollIntoView({ block: 'start' });
    alvo?.focus({ preventScroll: true });
  }, [hash]);
}
