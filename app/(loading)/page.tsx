import Home from '@/common/components/Home/Home';
import { portfolioViewModel } from '@/src/viewmodels/PortfolioViewModel';

const HomePage = async () => {
  const projects = await portfolioViewModel();
  return <Home projects={projects!} />;
};

export default HomePage;
