import About from '@/components/About/About';
import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import { Metadata } from 'next';

const description =
  'Yohan Etifier, consultant technique et développeur fullstack indépendant à Paris : solutions numériques sur mesure, architecture technique, intégration et déploiement, de l’analyse du besoin à la mise en production.';

export const metadata: Metadata = {
  title: 'About',
  description,
  openGraph: {
    title: 'About | Portfolio Yohan Etifier',
    description,
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Portfolio Yohan Etifier',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Portfolio Yohan Etifier',
    description,
  },
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  const projects = await portfolioViewModel();
  return <About projects={projects ?? []} />;
}
