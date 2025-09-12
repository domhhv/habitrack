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
import {
  CaretLeft,
  CaretRight,
  ArrowLineUp,
  ArrowLineDown,
} from '@phosphor-icons/react';
import {
  format,
  subDays,
  addDays,
  subWeeks,
  addWeeks,
  getISOWeek,
  startOfWeek,
} from 'date-fns';
import React from 'react';

import { useUser, useTextField, useScreenWidth } from '@hooks';
import { type NotePeriodKind } from '@models';
import { useNoteActions, usePeriodNotes } from '@stores';
import { handleAsyncAction } from '@utils';

type NoteDialogProps = {
  isOpen: boolean;
  periodDate: string;
  periodKind: NotePeriodKind;
  onClose: () => void;
  onPeriodChange: (opts: { date?: Date; kind?: NotePeriodKind }) => void;
};

const NoteDialog = ({
  isOpen,
  onClose,
  onPeriodChange,
  periodDate,
  periodKind,
}: NoteDialogProps) => {
  const { user } = useUser();
  const { isDesktop, isMobile, isTablet } = useScreenWidth();
  const [hasEdited, setHasEdited] = React.useState(false);
  const [content, handleContentChange, clearContent] = useTextField();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const notes = usePeriodNotes();
  const { addNote, deleteNote, updateNote } = useNoteActions();

  const existingNote = React.useMemo(() => {
    return notes.find((note) => {
      return note.periodKind === periodKind && note.periodDate === periodDate;
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
            periodDate,
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
            periodDate,
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
    return `week ${getISOWeek(new Date(periodDate))} of ${format(periodDate || '', 'yyyy')}`;
  };

  const period =
    periodKind === 'day'
      ? format(periodDate || '', 'iii, LLL d, y')
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
                      date: subDays(periodDate, 1),
                      kind: 'day',
                    });

                  case 'week':
                    return onPeriodChange({
                      date: subWeeks(periodDate, 1),
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
                      date: addDays(periodDate, 1),
                      kind: 'day',
                    });

                  case 'week':
                    return onPeriodChange({
                      date: addWeeks(periodDate, 1),
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
                        date: startOfWeek(periodDate),
                        kind: 'week',
                      });

                    case 'week':
                      return onPeriodChange({
                        date: startOfWeek(periodDate),
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
