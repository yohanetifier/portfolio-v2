import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import WorkList from '@/components/WorkList/WorkList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Works',
  description:
    'Explore the creative works and projects by Yohan Etifier. A collection of professional design and development projects showcasing innovative solutions and artistic vision.',
  openGraph: {
    title: 'Works | Portfolio Yohan Etifier',
    description:
      'Explore the creative works and projects by Yohan Etifier. A collection of professional design and development projects showcasing innovative solutions and artistic vision.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Portfolio Yohan Etifier',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Works | Portfolio Yohan Etifier',
    description:
      'Explore the creative works and projects by Yohan Etifier. A collection of professional design and development projects showcasing innovative solutions and artistic vision.',
  },
  alternates: {
    canonical: '/work',
  },
};

const WorkPage = async () => {
  const projects = await portfolioViewModel();
  return <WorkList projects={projects!} />;
};

export default WorkPage;
