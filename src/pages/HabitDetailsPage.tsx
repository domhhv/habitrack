import { Alert, Button, Spinner } from '@heroui/react';
import React from 'react';
import { Link, useParams } from 'react-router';

import { HabitDetails } from '@components';
import { useHabits, useIsFetchingHabits } from '@stores';

const HabitDetailsPage = () => {
  const { habitId = '' } = useParams();
  const habits = useHabits();
  const isFetchingHabits = useIsFetchingHabits();

  if (isFetchingHabits) {
    return <Spinner />;
  }

  if (!isFetchingHabits && !habits[habitId]) {
    return (
      <div className="mx-auto flex h-full w-3xl max-w-11/12 flex-1 items-center justify-center">
        <Alert
          color="danger"
          variant="solid"
          title="Habit not found"
          classNames={{
            title: 'font-bold',
          }}
          endContent={
            <Button as={Link} to="/habits" color="danger" variant="faded">
              My habits
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-7xl max-w-full">
      <title>{habits[habitId].name}</title>
      <HabitDetails habit={habits[habitId]} />
    </div>
  );
};

export default HabitDetailsPage;
