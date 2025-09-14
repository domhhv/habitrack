import {
  Modal,
  Button,
  Tooltip,
  Textarea,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
} from '@heroui/react';
import { startOfWeek, type CalendarDate } from '@internationalized/date';
import {
  CaretLeft,
  CaretRight,
  ArrowLineUp,
  ArrowLineDown,
} from '@phosphor-icons/react';
import React from 'react';
import { useLocale, useDateFormatter } from 'react-aria';

import { useUser, useTextField, useScreenWidth } from '@hooks';
import { type NotePeriodKind } from '@models';
import { useNoteActions, usePeriodNotes } from '@stores';
import { toSqlDate, getISOWeek, handleAsyncAction } from '@utils';

type NoteDialogProps = {
  isOpen: boolean;
  periodDate: CalendarDate;
  periodKind: NotePeriodKind;
  timeZone: string;
  onClose: () => void;
  onPeriodChange: (opts: {
    date?: CalendarDate;
    kind?: NotePeriodKind;
  }) => void;
};

const NoteDialog = ({
  isOpen,
  onClose,
  onPeriodChange,
  periodDate,
  periodKind,
  timeZone,
}: NoteDialogProps) => {
  const { user } = useUser();
  const { locale } = useLocale();
  const { isDesktop, isMobile, isTablet } = useScreenWidth();
  const [hasEdited, setHasEdited] = React.useState(false);
  const [content, handleContentChange, clearContent] = useTextField();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const notes = usePeriodNotes();
  const { addNote, deleteNote, updateNote } = useNoteActions();
  const dayFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone,
    weekday: 'short',
    year: 'numeric',
  });
  const monthFormatter = useDateFormatter({
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
    if (isOpen && existingNote?.content && !hasEdited) {
      handleContentChange(existingNote.content);
    } else if (isOpen && !existingNote?.content) {
      handleContentChange('');
    }
  }, [existingNote, handleContentChange, isOpen, hasEdited]);

  React.useEffect(() => {
    if (!isOpen) {
      clearContent();
    }
  }, [isOpen, clearContent]);

  const handleSubmit = async () => {
    if (!user) {
      return null;
    }

    setIsSaving(true);

    if (content) {
      if (!existingNote) {
        void handleAsyncAction(
          addNote({
            content,
            periodDate: toSqlDate(periodDate),
            periodKind,
            userId: user.id,
          }),
          'add_note',
          setIsSaving
        ).then(handleClose);
      } else if (existingNote.content !== content) {
        void handleAsyncAction(
          updateNote(existingNote.id, {
            content,
            periodDate: toSqlDate(periodDate),
            periodKind,
          }),
          'update_note',
          setIsSaving
        ).then(handleClose);
      }
    }
  };

  const handleRemove = async () => {
    if (!existingNote) {
      return;
    }

    void handleAsyncAction(
      deleteNote(existingNote.id),
      'remove_note',
      setIsRemoving
    ).then(handleClose);
  };

  const handleClose = () => {
    setIsSaving(false);
    setHasEdited(false);
    onClose();
    clearContent();
  };

  if (!periodDate) {
    return null;
  }

  const formatCurrentWeek = () => {
    return `week ${getISOWeek(periodDate.toDate(timeZone))} of ${monthFormatter.format(periodDate.toDate(timeZone))}`;
  };

  const period =
    periodKind === 'day'
      ? dayFormatter.format(periodDate.toDate(timeZone))
      : formatCurrentWeek();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement={isMobile || isTablet ? 'top' : 'center'}
    >
      <ModalContent>
        <ModalHeader className="items-center gap-2">
          <div className="space-x-2">
            <Button
              size="sm"
              isIconOnly
              variant="light"
              onPress={() => {
                switch (periodKind) {
                  case 'day':
                    return onPeriodChange({
                      date: periodDate.subtract({ days: 1 }),
                      kind: 'day',
                    });

                  case 'week':
                    return onPeriodChange({
                      date: periodDate.subtract({ weeks: 1 }),
                      kind: 'week',
                    });
                }
              }}
            >
              <CaretLeft size={18} weight="bold" />
            </Button>
            <Button
              size="sm"
              isIconOnly
              variant="light"
              onPress={() => {
                switch (periodKind) {
                  case 'day':
                    return onPeriodChange({
                      date: periodDate.add({ days: 1 }),
                      kind: 'day',
                    });

                  case 'week':
                    return onPeriodChange({
                      date: periodDate.add({ weeks: 1 }),
                      kind: 'week',
                    });
                }
              }}
            >
              <CaretRight size={18} weight="bold" />
            </Button>
            <Tooltip
              content={
                periodKind === 'day'
                  ? `Go to ${formatCurrentWeek()}`
                  : 'Go to days of this week'
              }
            >
              <Button
                size="sm"
                isIconOnly
                variant="light"
                onPress={() => {
                  switch (periodKind) {
                    case 'day':
                      return onPeriodChange({
                        date: startOfWeek(periodDate, locale),
                        kind: 'week',
                      });

                    case 'week':
                      return onPeriodChange({
                        date: startOfWeek(periodDate, locale),
                        kind: 'day',
                      });
                  }
                }}
              >
                {periodKind === 'day' ? (
                  <ArrowLineUp size={18} weight="bold" />
                ) : (
                  <ArrowLineDown size={18} weight="bold" />
                )}
              </Button>
            </Tooltip>
          </div>
          Note about {period}
        </ModalHeader>
        <ModalBody>
          <Textarea
            value={content}
            variant="faded"
            placeholder="Note"
            disabled={isSaving || isRemoving}
            onKeyDown={() => {
              return null;
            }}
            onChange={(event) => {
              setHasEdited(true);
              handleContentChange(event);
            }}
            classNames={
              !isDesktop
                ? {
                    input: 'text-base',
                  }
                : undefined
            }
          />
        </ModalBody>
        <ModalFooter>
          {!!existingNote && (
            <Button
              color="danger"
              disabled={isSaving}
              onPress={handleRemove}
              isLoading={isRemoving}
            >
              Remove
            </Button>
          )}
          <Button
            type="submit"
            color="primary"
            isLoading={isSaving}
            onPress={handleSubmit}
            isDisabled={!content || isRemoving}
          >
            {existingNote ? 'Save' : 'Add'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NoteDialog;
