import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import type { Occurrence } from '@models';
import { useBoundStore } from '@stores';

import OccurrenceUpdateFormContainer from './OccurrenceUpdateFormContainer';

const formViewProps = vi.fn();

vi.mock('./OccurrenceFormView', () => {
  return {
    default: (props: unknown) => {
      formViewProps(props);

      return null;
    },
  };
});

const occurrence = (id: string, photoPaths: string[]) => {
  return { id, photoPaths } as unknown as Occurrence;
};

const lastProps = () => {
  return formViewProps.mock.lastCall?.[0] as {
    occurrenceToEdit?: Occurrence;
    photoPaths: string[] | null;
  };
};

const showOccurrences = (
  occurrenceIdToEdit: string,
  ...occurrences: Occurrence[]
) => {
  act(() => {
    useBoundStore.setState((state) => {
      return {
        occurrenceDrawer: { ...state.occurrenceDrawer, occurrenceIdToEdit },
        occurrences,
      };
    });
  });
};

describe(OccurrenceUpdateFormContainer.name, () => {
  it('keeps the draft source when only the photos change', async () => {
    const original = occurrence('occurrence-1', ['a.jpg', 'b.jpg']);
    showOccurrences('occurrence-1', original);

    const Stub = createRoutesStub([
      { Component: OccurrenceUpdateFormContainer, path: '/' },
    ]);
    render(<Stub />);

    await waitFor(() => {
      expect(lastProps()?.occurrenceToEdit).toBe(original);
    });

    showOccurrences('occurrence-1', occurrence('occurrence-1', ['b.jpg']));

    expect(lastProps().occurrenceToEdit).toBe(original);
    expect(lastProps().photoPaths).toEqual(['b.jpg']);

    const next = occurrence('occurrence-2', []);
    showOccurrences('occurrence-2', next);

    expect(lastProps().occurrenceToEdit).toBe(next);
  });
});
