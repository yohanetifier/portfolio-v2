import Contact from '@/components/Contact/Contact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Yohan Etifier. Connect for collaborations, project inquiries, or just to say hello. Available for freelance opportunities and creative partnerships.',
  openGraph: {
    title: 'Contact | Portfolio Yohan Etifier',
    description:
      'Get in touch with Yohan Etifier. Connect for collaborations, project inquiries, or just to say hello. Available for freelance opportunities and creative partnerships.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Portfolio Yohan Etifier',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Portfolio Yohan Etifier',
    description:
      'Get in touch with Yohan Etifier. Connect for collaborations, project inquiries, or just to say hello. Available for freelance opportunities and creative partnerships.',
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return <Contact />;
}
