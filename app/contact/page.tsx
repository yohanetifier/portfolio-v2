import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Yohan Etifier. Connect for collaborations, project inquiries, or just to say hello. Available for freelance opportunities and creative partnerships.',
  openGraph: {
    title: 'Contact | Portfolio Yohan Etifier',
    description: 'Get in touch with Yohan Etifier. Connect for collaborations, project inquiries, or just to say hello. Available for freelance opportunities and creative partnerships.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Portfolio Yohan Etifier',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Portfolio Yohan Etifier',
    description: 'Get in touch with Yohan Etifier. Connect for collaborations, project inquiries, or just to say hello. Available for freelance opportunities and creative partnerships.',
  },
  alternates: {
    canonical: '/contact',
  }
}

const page = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center z-20 relative flex-col">
      <h2 className="uppercase">Send me an email:</h2>
      <a href="mailto:yohan@yohanetifier.com">yohan@yohanetifier.com</a>
    </div>
  );
};

export default page;
