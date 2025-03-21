import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

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
      <body
        className={`antialiased overflow-hidden`}
        style={{ backgroundColor: '#ffffff' }}
      >
        <div
          className={`w-full grid grid-rows-10 grid-cols-10 gap-[20px] h-[300vh] z-[2] border-2 border-purple-600 absolute top-0 bg-white`}
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
