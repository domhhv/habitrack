import { it, expect, describe } from 'vitest';

import { parseNotesCursor, encodeNotesCursor } from './notes-cursor';

const cursor = {
  createdAt: '2026-07-10T10:00:00.123456+00:00',
  id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
};

describe('notes cursor', () => {
  it('round-trips the creation time and id', () => {
    expect(parseNotesCursor(encodeNotesCursor(cursor))).toEqual(cursor);
  });

  it('rejects missing or malformed cursors', () => {
    expect(parseNotesCursor(null)).toBeNull();
    expect(parseNotesCursor('')).toBeNull();
    expect(parseNotesCursor(cursor.id)).toBeNull();
    expect(parseNotesCursor(`not-a-date~${cursor.id}`)).toBeNull();
    expect(parseNotesCursor(`${cursor.createdAt}~not-an-id`)).toBeNull();
    expect(parseNotesCursor(`~${cursor.id}`)).toBeNull();
  });
});
