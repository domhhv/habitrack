import {
  Modal,
  Button,
  Textarea,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
} from '@heroui/react';
import { format, getISOWeek } from 'date-fns';
import React from 'react';

import { handleAsyncAction } from '@helpers';
import { useUser, useTextField } from '@hooks';
import { type NotePeriodKind } from '@models';
import { useNotes, useNoteActions } from '@stores';
import { toEventLike, isNoteOfPeriod } from '@utils';

type NoteDialogProps = {
  isOpen: boolean;
  periodDate: string;
  periodKind: NotePeriodKind;
  onClose: () => void;
};

const NoteDialog = ({
  isOpen,
  onClose,
  periodDate,
  periodKind,
}: NoteDialogProps) => {
  const { user } = useUser();
  const [hasEdited, setHasEdited] = React.useState(false);
  const [content, handleContentChange, clearContent] = useTextField();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const notes = useNotes();
  const { addNote, deleteNote, updateNote } = useNoteActions();

  const existingNote = React.useMemo(() => {
    return Object.values(notes)
      .filter(isNoteOfPeriod)
      .find((note) => {
        return note.periodKind === periodKind && note.periodDate === periodDate;
      });
  }, [notes, periodDate, periodKind]);

  React.useEffect(() => {
    if (isOpen && existingNote?.content && !hasEdited) {
      handleContentChange(toEventLike(existingNote.content));
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

  const period =
    periodKind === 'day'
      ? format(periodDate || '', 'iii, LLL d, y')
      : `Week ${getISOWeek(new Date(periodDate))} of ${format(periodDate || '', 'yyyy')}`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>Note about {period}</ModalHeader>
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
