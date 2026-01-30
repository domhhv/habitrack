import { Chip } from '@heroui/react';
import { PlusIcon } from '@phosphor-icons/react';

import { METRIC_PRESETS, type MetricPreset } from '@models';

type MetricPresetChipsProps = {
  onSelect: (preset: MetricPreset) => void;
};

const MetricPresetChips = ({ onSelect }: MetricPresetChipsProps) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {METRIC_PRESETS.map((preset) => {
        return (
          <Chip
            size="sm"
            variant="flat"
            key={preset.name}
            className="cursor-pointer"
            startContent={<PlusIcon size={12} />}
            onClick={() => {
              onSelect(preset);
            }}
          >
            {preset.name}
          </Chip>
        );
      })}
    </div>
  );
};

export default MetricPresetChips;
