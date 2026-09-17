import NotFoundView from '@/components/NotFound/NotFound';
import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import { Metadata } from 'next';

/**
 * Catch-all = vraie page App Router (status 200 UI 404).
 * Évite not-found.tsx dont la sortie vers /contact remonte layout/canvas
 * et donne l’impression d’un reload.
 */
export const metadata: Metadata = {
  title: '404',
  description: 'Page not found — lost at sea.',
};

export default async function LostAtSeaPage() {
  const projects = await portfolioViewModel();
  return <NotFoundView projects={projects ?? []} />;
}
