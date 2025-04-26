import type { Note, NotePeriod } from '@models';

export const noteTargetIsPeriod = (input: Note): input is NotePeriod => {
  if ('occurrenceId' in input && input.occurrenceId !== null) {
    return false;
  }

  return 'periodKind' in input && 'periodDate' in input;
};

export default noteTargetIsPeriod;
