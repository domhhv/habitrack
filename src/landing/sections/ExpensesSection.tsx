import LandingSection from '../LandingSection';
import { ExpenseSummaryMockup } from '../mockups';

const ExpensesSection = () => {
  return (
    <LandingSection
      muted
      id="costs"
      eyebrow="Costs"
      title="Know what a habit really costs"
      description="Every log inherits its cost from the stock it consumed. Habitrack adds it all up per habit and per day, week, and month — in every currency you buy in."
    >
      <ExpenseSummaryMockup />
    </LandingSection>
  );
};

export default ExpensesSection;
