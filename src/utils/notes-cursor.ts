import type { Note } from '@models';

export type NotesCursor = Pick<Note, 'createdAt' | 'id'>;

const CURSOR_SEPARATOR = '~';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const encodeNotesCursor = ({ createdAt, id }: NotesCursor) => {
  return `${createdAt}${CURSOR_SEPARATOR}${id}`;
};

export const parseNotesCursor = (value: string | null): NotesCursor | null => {
  if (!value) {
    return null;
  }

  const separatorIndex = value.lastIndexOf(CURSOR_SEPARATOR);
  const createdAt = value.slice(0, separatorIndex);
  const id = value.slice(separatorIndex + 1);

  if (
    separatorIndex <= 0 ||
    !UUID_PATTERN.test(id) ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    return null;
  }

  return { createdAt, id };
};
