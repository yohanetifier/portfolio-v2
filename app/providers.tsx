'use client';

import { HeaderProvider } from '@/contexts/HeaderContext';
import { ThreeJsProvider } from '@/contexts/ThreeJsContext';
import MenuProvider from '@/contexts/MenuProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <HeaderProvider>
        <ThreeJsProvider>{children}</ThreeJsProvider>
      </HeaderProvider>
    </MenuProvider>
  );
}
