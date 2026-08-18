'use client';

import { HeaderProvider } from '@/contexts/HeaderContext';
import MenuProvider from '@/contexts/MenuProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <HeaderProvider>{children}</HeaderProvider>
    </MenuProvider>
  );
}
