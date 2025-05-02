import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/common/components/Header/Header';
import Menu from '@/common/components/Menu/Menu';
import MenuProvider from '@/contexts/MenuProvider';

export const metadata: Metadata = {
  title: 'Yohan Etifier | Portfolio Yohan Etifier',
  icons: {
    icon: '/favicon-16x16.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased overflow-hidden`}
        style={{ backgroundColor: '#ffffff' }}
      >
        <div
          className={`w-full grid grid-rows-10 grid-cols-10 gap-[20px] h-[300vh] z-[1] scale-0 absolute top-0 bg-white`}
          id={'grid'}
        ></div>
        <div
          className="fixed top-0 w-screen h-screen z-[2]"
          id="fullscreen"
        ></div>
        <MenuProvider>
          <Menu />
          <Header />
        </MenuProvider>
        {children}
      </body>
    </html>
  );
}
