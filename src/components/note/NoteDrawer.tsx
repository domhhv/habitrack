import {
  cn,
  Label,
  Drawer,
  TextArea,
  TextField,
  FieldError,
} from '@heroui/react';
import {
  endOfWeek,
  endOfMonth,
  getLocalTimeZone,
} from '@internationalized/date';
import { CaretDownIcon } from '@phosphor-icons/react';
import React from 'react';
import { useLocale, useDateFormatter } from 'react-aria';
import { href, useFetcher } from 'react-router';

import { CustomKbd, ActionForm, CustomButton } from '@components';
import {
  useUser,
  useTextField,
  useScreenWidth,
  useModifierKeys,
  useActionFetcher,
  useFirstDayOfWeek,
} from '@hooks';
import type { Note } from '@models';
import {
  useNoteDrawerState,
  useNoteDrawerActions,
  useConfirmationActions,
} from '@stores';
import { getISOWeek, isNoteOfPeriod } from '@utils';

import NotePeriodPicker from './NotePeriodPicker';

const NoteDrawer = () => {
  const timeZone = getLocalTimeZone();
  const { locale } = useLocale();
  const user = useUser();
  const [content, changeContent, clearContent] = useTextField();
  const { isDesktop, isMobile } = useScreenWidth();
  const [isPeriodPickerShown, setIsPeriodPickerShown] = React.useState(false);
  const { enter, mod } = useModifierKeys();
  const { isOpen, periodDate, periodKind } = useNoteDrawerState();
  const { closeNoteDrawer } = useNoteDrawerActions();
  const { askConfirmation } = useConfirmationActions();
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
  const firstDayOfWeek = useFirstDayOfWeek();

  const alignPeriodDate = React.useCallback(() => {
    return periodKind === 'week' && firstDayOfWeek === 'sun'
      ? periodDate.add({ days: 1 }).toString()
      : periodDate.toString();
  }, [periodKind, periodDate, firstDayOfWeek]);

  const noteFetcher = useFetcher<{ note: Note | null }>();
  const { load: loadNote } = noteFetcher;
  const loadedNote = noteFetcher.data?.note;
  const isLoadingNote = noteFetcher.state !== 'idle';
  const existingNote =
    loadedNote &&
    isNoteOfPeriod(loadedNote) &&
    loadedNote.periodKind === periodKind &&
    loadedNote.periodDate === alignPeriodDate()
      ? loadedNote
      : undefined;

  React.useEffect(() => {
    if (isOpen && user) {
      void loadNote(
        `${href('/resources/notes')}?${new URLSearchParams({ date: alignPeriodDate(), kind: periodKind })}`
      );
    }
  }, [isOpen, user, periodKind, alignPeriodDate, loadNote]);

  React.useEffect(() => {
    if (isOpen && existingNote?.content) {
      changeContent(existingNote.content);
    } else {
      clearContent();
    }
  }, [existingNote, changeContent, isOpen, clearContent]);

  const hasUnsavedChanges = !!content && existingNote?.content !== content;

  const confirmUnsavedChanges = React.useCallback(async () => {
    if (!hasUnsavedChanges) {
      return true;
    }

    return askConfirmation({
      cancelText: 'Keep editing',
      confirmText: 'Discard',
      title: 'Unsaved changes',
      variant: 'secondary',
      description:
        'You have unsaved changes. Are you sure you want to discard them?',
    });
  }, [hasUnsavedChanges, askConfirmation]);

  const closeDrawer = () => {
    closeNoteDrawer();
    clearContent();
  };

  const saveFetcher = useActionFetcher(closeDrawer);
  const removeFetcher = useActionFetcher(closeDrawer);
  const isSaving = saveFetcher.state !== 'idle';
  const isRemoving = removeFetcher.state !== 'idle';

  const canSaveNote =
    !!user &&
    !!content &&
    !isSaving &&
    !isRemoving &&
    !isLoadingNote &&
    existingNote?.content !== content;

  const closeDrawerWithConfirmation = async () => {
    if (await confirmUnsavedChanges()) {
      closeDrawer();
    }
  };

  const removeNote = () => {
    if (existingNote && !isRemoving) {
      void removeFetcher.submit(
        { intent: 'delete', noteId: existingNote.id },
        { action: href('/resources/notes'), method: 'post' }
      );
    }
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
        return endOfWeek(periodDate, locale, firstDayOfWeek);

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

  const changeOpen = async (isOpen: boolean) => {
    if (!isOpen) {
      if (await confirmUnsavedChanges()) {
        closeDrawer();
        setIsPeriodPickerShown(false);
      }
    }
  };

  return (
    <Drawer isOpen={isOpen} onOpenChange={changeOpen}>
      <Drawer.Backdrop>
        <Drawer.Content placement={isMobile ? 'bottom' : 'right'}>
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header className="flex-row items-center gap-2">
              <span>Note for {formatPeriod()}</span>
              <CustomButton
                size="sm"
                isIconOnly
                variant="ghost"
                onPress={togglePeriodPicker}
              >
                <CaretDownIcon
                  size={16}
                  className={cn(
                    'transition-transform duration-300 ease-linear',
                    isPeriodPickerShown && 'rotate-180'
                  )}
                />
              </CustomButton>
            </Drawer.Header>
            <ActionForm
              fetcher={saveFetcher}
              action={href('/resources/notes')}
              className="max-h-[calc(100%-64px)]"
              onSubmit={(event) => {
                if (!canSaveNote) {
                  event.preventDefault();
                }
              }}
            >
              <input
                type="hidden"
                name="intent"
                value={existingNote ? 'update' : 'create'}
              />
              <input
                type="hidden"
                name="noteId"
                value={existingNote?.id ?? ''}
              />
              <input type="hidden" name="periodKind" value={periodKind} />
              <input
                type="hidden"
                name="periodDate"
                value={alignPeriodDate()}
              />
              <Drawer.Body className="w-full space-y-4 py-0.5">
                <NotePeriodPicker
                  endRange={getEndRangeDate()}
                  isShown={isPeriodPickerShown}
                  onBeforeChange={confirmUnsavedChanges}
                />
                <TextField
                  fullWidth
                  isRequired
                  name="content"
                  value={content}
                  variant="secondary"
                  className="max-h-full"
                  onChange={changeContent}
                >
                  <Label className="after:hidden">Your note</Label>
                  <TextArea
                    autoFocus
                    disabled={isSaving || isRemoving}
                    placeholder={`Start typing your note about this ${periodKind}...`}
                    className={cn(
                      'field-sizing-content max-h-full min-h-20 resize-y',
                      !isDesktop && 'text-base'
                    )}
                    onKeyDown={(event) => {
                      if (
                        (event.metaKey || event.ctrlKey) &&
                        event.key === 'Enter'
                      ) {
                        event.currentTarget.form?.requestSubmit();
                      }

                      if (event.key === 'Escape') {
                        void closeDrawerWithConfirmation();
                      }

                      return null;
                    }}
                  />
                  <FieldError />
                  {getTextareaDescription() && (
                    <p className="text-foreground-500 text-sm">
                      {getTextareaDescription()}
                    </p>
                  )}
                </TextField>
              </Drawer.Body>
              <Drawer.Footer className="w-full self-end pt-0 sm:w-auto">
                {!!existingNote && (
                  <CustomButton
                    variant="danger"
                    onPress={removeNote}
                    isPending={isRemoving}
                    isDisabled={isRemoving}
                  >
                    Remove
                  </CustomButton>
                )}
                <CustomButton
                  type="submit"
                  variant="primary"
                  isPending={isSaving}
                  isDisabled={!canSaveNote}
                  fullWidth={isMobile && !existingNote}
                >
                  <CustomKbd size="md" variant="default">
                    {mod} {enter}
                  </CustomKbd>
                  {existingNote ? 'Save' : 'Add'}
                </CustomButton>
              </Drawer.Footer>
            </ActionForm>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default NoteDrawer;
