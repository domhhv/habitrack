import {
  cn,
  Kbd,
  Form,
  Drawer,
  Button,
  Textarea,
  DrawerBody,
  DrawerHeader,
  DrawerFooter,
  DrawerContent,
} from '@heroui/react';
import {
  endOfWeek,
  endOfMonth,
  getLocalTimeZone,
} from '@internationalized/date';
import { CaretDownIcon } from '@phosphor-icons/react';
import type { FormEvent } from 'react';
import React from 'react';
import { useLocale, useDateFormatter } from 'react-aria';

import {
  useUser,
  useTextField,
  useScreenWidth,
  useHasKeyboard,
  useModifierKeys,
} from '@hooks';
import {
  usePeriodNotes,
  useNoteActions,
  useNoteDrawerState,
  useNoteDrawerActions,
} from '@stores';
import { toSqlDate, getISOWeek, handleAsyncAction } from '@utils';

import NotePeriodPicker from './NotePeriodPicker';

const NoteDrawer = () => {
  const timeZone = getLocalTimeZone();
  const notes = usePeriodNotes();
  const { addNote, deleteNote, updateNote } = useNoteActions();
  const { locale } = useLocale();
  const { user } = useUser();
  const [content, changeContent, clearContent] = useTextField();
  const { isDesktop, isMobile } = useScreenWidth();
  const [isPeriodPickerShown, setIsPeriodPickerShown] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const { mod } = useModifierKeys();
  const hasKeyboard = useHasKeyboard();
  const { isOpen, periodDate, periodKind } = useNoteDrawerState();
  const { closeNoteDrawer } = useNoteDrawerActions();
  const dayFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone,
    weekday: 'short',
    year: 'numeric',
  });
  const shortMonthFormatter = useDateFormatter({
    month: 'short',
    timeZone,
  });
  const longMonthFormatter = useDateFormatter({
    month: 'long',
    timeZone,
  });

  const existingNote = React.useMemo(() => {
    return notes.find((note) => {
      return (
        note.periodKind === periodKind &&
        note.periodDate === toSqlDate(periodDate)
      );
    });
  }, [notes, periodDate, periodKind]);

  React.useEffect(() => {
    if (isOpen && existingNote?.content) {
      changeContent(existingNote.content);
    } else {
      clearContent();
    }
  }, [existingNote, changeContent, isOpen, clearContent]);

  const closeDrawer = () => {
    setIsRemoving(false);
    setIsSaving(false);
    closeNoteDrawer();
    clearContent();
  };

  const submitNote = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!user || !periodDate || !content || existingNote?.content === content) {
      return null;
    }

    if (!existingNote) {
      return handleAsyncAction(
        addNote({
          content,
          periodDate: toSqlDate(periodDate),
          periodKind,
          userId: user.id,
        }),
        'add_note',
        setIsSaving
      ).then(closeDrawer);
    }

    if (existingNote.content !== content) {
      return handleAsyncAction(
        updateNote(existingNote.id, {
          content,
          periodDate: toSqlDate(periodDate),
          periodKind,
        }),
        'update_note',
        setIsSaving
      ).then(closeDrawer);
    }
  };

  const removeNote = async () => {
    if (!existingNote) {
      return;
    }

    void handleAsyncAction(
      deleteNote(existingNote.id),
      'remove_note',
      setIsRemoving
    ).then(closeDrawer);
  };

  const formatPeriod = () => {
    if (periodKind === 'day') {
      return dayFormatter.format(periodDate.toDate(timeZone));
    }

    if (periodKind === 'week') {
      return `week ${getISOWeek(periodDate.toDate(timeZone))} of ${longMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.year}`;
    }

    if (periodKind === 'month') {
      return `${longMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.year}`;
    }

    return '';
  };

  const getEndRangeDate = () => {
    switch (periodKind) {
      case 'day':
        return periodDate;

      case 'week':
        return endOfWeek(periodDate, locale);

      case 'month':
        return endOfMonth(periodDate);

      default:
        return periodDate;
    }
  };

  const getTextareaDescription = () => {
    const action = existingNote ? 'editing' : 'adding';

    if (periodKind === 'day') {
      return `You're ${action} a note for a single day`;
    }

    if (periodKind === 'week') {
      const duration = `${shortMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.day} to ${shortMonthFormatter.format(getEndRangeDate().toDate(timeZone))} ${getEndRangeDate().day}`;

      return `You're ${action} a note for an entire week: ${duration}. It will live independently from notes added for any days of this week.`;
    }

    if (periodKind === 'month') {
      const duration = `${shortMonthFormatter.format(periodDate.toDate(timeZone))} ${periodDate.day}-${getEndRangeDate().day}`;

      return `You're ${action} a note for the whole month: ${duration}. It will live independently from notes added for any days or weeks of this month.`;
    }

    return '';
  };

  const togglePeriodPicker = () => {
    setIsPeriodPickerShown((prev) => {
      return !prev;
    });
  };

  const changeOpen = (isOpen: boolean) => {
    if (!isOpen) {
      closeNoteDrawer();
      setIsPeriodPickerShown(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={changeOpen}
      size={isMobile ? 'full' : 'lg'}
    >
      <DrawerContent>
        <DrawerHeader className="items-center gap-2">
          Note for {formatPeriod()}
          <Button
            size="sm"
            isIconOnly
            variant="light"
            onPress={togglePeriodPicker}
          >
            <CaretDownIcon
              size={16}
              className={cn(
                'transition-transform',
                isPeriodPickerShown && 'rotate-180'
              )}
            />
          </Button>
        </DrawerHeader>
        <Form onSubmit={submitNote}>
          <DrawerBody className="w-full space-y-4">
            <NotePeriodPicker
              endRange={getEndRangeDate()}
              isShown={isPeriodPickerShown}
            />
            <Textarea
              autoFocus
              isRequired
              name="content"
              value={content}
              variant="faded"
              disableAutosize
              label="Your note"
              labelPlacement="outside"
              onChange={changeContent}
              disabled={isSaving || isRemoving}
              description={getTextareaDescription()}
              defaultValue={existingNote?.content || ''}
              placeholder={`Start typing your note about this ${periodKind}...`}
              errorMessage={`Empty notes are not allowed. ${existingNote ? 'If you want to empty an existing note, please remove it instead.' : ''}`}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  void submitNote();
                }

                return null;
              }}
              classNames={{
                label: 'after:hidden',
                input: cn(
                  'resize-y min-h-25 field-sizing-content max-h-96',
                  !isDesktop && 'text-base'
                ),
              }}
            />
          </DrawerBody>
          <DrawerFooter className="self-end">
            {!!existingNote && (
              <Button
                color="danger"
                onPress={removeNote}
                disabled={isRemoving}
                isLoading={isRemoving}
              >
                Remove
              </Button>
            )}
            <Button
              type="submit"
              color="primary"
              isLoading={isSaving}
              isDisabled={
                isRemoving || !content || existingNote?.content === content
              }
            >
              {hasKeyboard && (
                <>
                  <Kbd className="[&_span]:text-default-500 dark:[&_span]:text-default-700">
                    {mod}
                  </Kbd>
                  <Kbd
                    keys={['enter']}
                    className="[&_abbr]:text-default-500 dark:[&_abbr]:text-default-700"
                  />
                </>
              )}
              {existingNote ? 'Save' : 'Add'}
            </Button>
          </DrawerFooter>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};

export default NoteDrawer;
