import NotFoundView from '@/components/NotFound/NotFound';
import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import { Metadata } from 'next';

/** Pour notFound() (ex. projet invalide). Les URLs inconnues passent par app/[...slug]. */
export const metadata: Metadata = {
  title: '404',
  description: 'Page not found — lost at sea.',
};

export default async function NotFound() {
  const projects = await portfolioViewModel();
  return <NotFoundView projects={projects ?? []} />;
}
