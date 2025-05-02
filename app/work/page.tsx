import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';
import WorkList from '@/common/components/WorkList/WorkList';

const HomePage = async () => {
  const projects = await portfolioViewModel();
  return <WorkList projects={projects!} />;
};

export default HomePage;
