'use client';

import { HeaderProvider } from '@/contexts/HeaderContext';
import { ThreeJsProvider } from '@/contexts/ThreeJsContext';
import MenuProvider from '@/contexts/MenuProvider';
import SmoothScroll from '@/components/SmoothScroll/SmoothScroll';
import CursorFollow from '@/components/CursorFollow/CursorFollow';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <HeaderProvider>
        <ThreeJsProvider>
          <SmoothScroll>
            <CursorFollow />
            {children}
          </SmoothScroll>
        </ThreeJsProvider>
      </HeaderProvider>
    </MenuProvider>
  );
}
