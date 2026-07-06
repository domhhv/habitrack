import LandingSection from '../LandingSection';
import { StockCardMockup } from '../mockups';

const StocksSection = () => {
  return (
    <LandingSection
      id="stocks"
      eyebrow="Stocks"
      title="Keep count of the things your habits use"
      description="Some habits consume real, countable stuff. Add a stock — a bag of beans, a box of gels — and Habitrack depletes it automatically every time you log, prefilling your metrics with each item's defaults."
    >
      <StockCardMockup />
    </LandingSection>
  );
};

export default StocksSection;
