import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
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
    <html lang="en" style={{ backgroundColor: '#f0f0f0' }}>
      <body className={`antialiased`} style={{ backgroundColor: '#ffffff' }}>
        <div
          className={`w-full grid grid-rows-10 grid-cols-10 gap-[20px] h-[300vh] z-[2] absolute top-0 bg-white`}
          id={'grid'}
        ></div>
        <div
          className="fixed top-0 w-screen h-screen z-0"
          id="fullscreen"
        ></div>
        {children}
      </body>
    </html>
  );
}
