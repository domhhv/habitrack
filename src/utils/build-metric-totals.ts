import type {
  NumberMetricConfig,
  DurationMetricConfig,
  OccurrenceSummaryItem,
} from '@models';

type MetricTotal = { formattedTotal: string; name: string };

const buildMetricTotals = (
  summary: OccurrenceSummaryItem[]
): Record<string, MetricTotal[]> => {
  const totals: Record<string, MetricTotal[]> = {};

  for (const { habitId, occurrences: habitOccurrences } of summary) {
    const [first] = habitOccurrences;
    const metricDefinitions = first.habit.metricDefinitions;

    const summableMetrics = metricDefinitions
      .filter((m) => {
        return m.type === 'number' || m.type === 'duration';
      })
      .sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });

    if (summableMetrics.length === 0) {
      continue;
    }

    const sums: MetricTotal[] = [];

    for (const metric of summableMetrics) {
      let sum = 0;
      let hasValues = false;

      for (const occ of habitOccurrences) {
        const mv = occ.metricValues.find((v) => {
          return v.habitMetricId === metric.id;
        });

        if (!mv) {
          continue;
        }

        const value = mv.value as Record<string, unknown>;

        if (metric.type === 'number') {
          sum += (value as { numericValue: number }).numericValue;
          hasValues = true;
        } else if (metric.type === 'duration') {
          sum += (value as { durationMs: number }).durationMs;
          hasValues = true;
        }
      }

      if (!hasValues) {
        continue;
      }

      let formattedTotal: string;

      if (metric.type === 'number') {
        const config = metric.config as NumberMetricConfig;
        const formatted =
          config.decimalPlaces != null
            ? sum.toFixed(config.decimalPlaces)
            : String(sum);

        formattedTotal = config.unit
          ? `${formatted} ${config.unit}`
          : formatted;
      } else {
        const config = metric.config as DurationMetricConfig;
        const totalSec = Math.floor(sum / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;

        if (config.format === 'minutes') {
          formattedTotal = `${Math.floor(sum / 60000)} min`;
        } else if (config.format === 'seconds') {
          formattedTotal = `${totalSec} sec`;
        } else if (config.format === 'hh:mm:ss') {
          formattedTotal = `${h}h ${m}m ${s}s`;
        } else {
          formattedTotal = `${h}h ${m}m`;
        }
      }

      sums.push({ formattedTotal, name: metric.name });
    }

    if (sums.length > 0) {
      totals[habitId] = sums;
    }
  }

  return totals;
};

export default buildMetricTotals;
