import { Alert, Spinner } from '@heroui/react';
import React from 'react';
import { useParams, useNavigate } from 'react-router';

import { CustomButton, HabitDetails } from '@components';
import { useHabits, useIsFetchingHabits } from '@stores';

const HabitDetailsPage = () => {
  const { habitId = '' } = useParams();
  const navigate = useNavigate();
  const habits = useHabits();
  const isFetchingHabits = useIsFetchingHabits();

  if (isFetchingHabits) {
    return <Spinner />;
  }

  if (!isFetchingHabits && !habits[habitId]) {
    return (
      <div className="mx-auto flex h-full w-3xl max-w-11/12 flex-1 items-center justify-center">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="font-bold">Habit not found</Alert.Title>
          </Alert.Content>
          <CustomButton
            variant="danger-soft"
            onPress={() => {
              navigate('/habits');
            }}
          >
            My habits
          </CustomButton>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-7xl max-w-full px-8 pb-2 lg:px-16">
      <title>{habits[habitId].name}</title>
      <HabitDetails habit={habits[habitId]} />
    </div>
  );
};

export default HabitDetailsPage;
