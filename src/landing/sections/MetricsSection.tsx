import LandingSection from '../LandingSection';
import { MetricInputsMockup } from '../mockups';

const METRIC_TYPES = [
  { example: '5.2 km', name: 'Number' },
  { example: '41 min', name: 'Duration' },
  { example: '85%', name: 'Percentage' },
  { example: '4 of 5', name: 'Scale' },
  { example: '60–90 bpm', name: 'Range' },
  { example: 'Park loop', name: 'Choice' },
  { example: 'Yes / No', name: 'Boolean' },
  { example: '“Felt strong”', name: 'Text' },
];

const MetricsSection = () => {
  return (
    <LandingSection
      muted
      id="metrics"
      eyebrow="Metrics"
      title="Measure habits down to the last detail"
      description="Give any habit its own metrics and fill them in as you log. Eight types cover everything from grams and minutes to gut feelings — and numeric ones add up per day, week, and month."
    >
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          {METRIC_TYPES.map((type) => {
            return (
              <div
                key={type.name}
                className="rounded-xl border border-(--border) bg-(--surface) px-4 py-3"
              >
                <p className="text-xs font-extrabold">{type.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-(--muted)">
                  {type.example}
                </p>
              </div>
            );
          })}
        </div>
        <MetricInputsMockup />
      </div>
    </LandingSection>
  );
};

export default MetricsSection;
