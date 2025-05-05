import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/common/components/Header/Header';
import Menu from '@/common/components/Menu/Menu';
import MenuProvider from '@/contexts/MenuProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | Portfolio Yohan Etifier',
    default: 'Yohan Etifier | Portfolio Yohan Etifier'
  },
  description: 'Portfolio of Yohan Etifier - Creative developer and designer showcasing innovative projects and creative solutions.',
  keywords: ['portfolio', 'developer', 'designer', 'creative', 'projects', 'web development', 'design'],
  authors: [{ name: 'Yohan Etifier' }],
  creator: 'Yohan Etifier',
  publisher: 'Yohan Etifier',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yohanetifier.com',
    siteName: 'Portfolio Yohan Etifier',
    title: 'Yohan Etifier | Portfolio',
    description: 'Portfolio of Yohan Etifier - Creative developer and designer showcasing innovative projects and creative solutions.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yohan Etifier Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yohan Etifier | Portfolio',
    description: 'Portfolio of Yohan Etifier - Creative developer and designer showcasing innovative projects and creative solutions.',
    images: ['/og-image.jpg'],
    creator: '@yohanetifier',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon-16x16.png',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-site-verification',
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
