'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

interface HeaderContextType {
  isHeaderVisible: boolean;
  setHeaderVisible: (visible: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isHeaderVisible, setHeaderVisible] = useState(true);

  // On prod, pathname can be null on first paint — keep header hidden on intro.
  useEffect(() => {
    if (!pathname || pathname === '/') {
      setHeaderVisible(false);
    }
  }, [pathname]);

  return (
    <HeaderContext.Provider value={{ isHeaderVisible, setHeaderVisible }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext(): HeaderContextType {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
}
