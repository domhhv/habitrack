import { Button, Tooltip } from '@heroui/react';
import React from 'react';
import { useFetcher } from 'react-router';

import { InfinityLoader, VisuallyHiddenInput } from '@components';
import { useUser } from '@hooks';
import { type Habit, StorageBuckets } from '@models';
import { getPublicUrl } from '@services';

type HabitIconCellProps = {
  habit: Habit;
};

const HabitIcon = ({ habit }: HabitIconCellProps) => {
  const user = useUser();
  const fetcher = useFetcher();
  const isUploading = fetcher.state !== 'idle';
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target: { files },
  }) => {
    if (!user || !files?.length || isUploading) {
      return;
    }

    const formData = new FormData();

    formData.set('icon', files[0]);

    void fetcher.submit(formData, {
      action: `/habits/${habit.id}`,
      encType: 'multipart/form-data',
      method: 'post',
    });
  };

  return (
    <Tooltip delay={0} closeDelay={0}>
      <Tooltip.Trigger>
        <Button
          variant="ghost"
          aria-label="Upload habit icon"
          isDisabled={!user?.id || isUploading}
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="rounded-medium hover:bg-surface-tertiary flex h-12 w-12 cursor-pointer items-center justify-center p-1 opacity-100"
        >
          {isUploading ? (
            <InfinityLoader size={32} color="var(--accent)" />
          ) : (
            <img
              alt={habit.name}
              role="habit-icon"
              className="h-8 w-8"
              src={getPublicUrl(StorageBuckets.HABIT_ICONS, habit.iconPath)}
            />
          )}
        </Button>
        <VisuallyHiddenInput
          ref={fileInputRef}
          isDisabled={isUploading}
          onChange={handleFileChange}
        />
      </Tooltip.Trigger>
      <Tooltip.Content>Upload new icon</Tooltip.Content>
    </Tooltip>
  );
};

export default HabitIcon;
