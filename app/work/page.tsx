import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import WorkList from '@/common/components/WorkList/WorkList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Works' 
}

const WorkPage = async () => {
  const projects = await portfolioViewModel();
  return <WorkList projects={projects!} />;
};

export default WorkPage;
