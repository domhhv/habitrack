import { getHabits } from '@actions';
import React from 'react';

export type Habit = {
  id: number;
  name: string;
  description: string;
  trait: 'good' | 'bad';
};

export const HabitsContext = React.createContext({
  habits: [] as Habit[],
  setHabits: (_: Habit[] | ((prevHabits: Habit[]) => Habit[])) => {},
});

type Props = {
  children: React.ReactNode;
};

export default function HabitsProvider({ children }: Props) {
  const [habits, setHabits] = React.useState<Habit[]>([]);

  React.useEffect(() => {
    getHabits().then(setHabits);
  }, []);

  const value = React.useMemo(() => ({ habits, setHabits }), [habits]);

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}
