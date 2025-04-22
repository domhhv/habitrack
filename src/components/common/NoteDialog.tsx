import { handleAsyncAction } from '@helpers';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useUser, useTextField } from '@hooks';
import { useNotes, useNoteActions } from '@stores';
import { toEventLike } from '@utils';
import { format } from 'date-fns';
import React from 'react';

type NoteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  day: string;
};

const NoteDialog = ({ isOpen, onClose, day }: NoteDialogProps) => {
  const { user } = useUser();
  const [content, handleContentChange, clearContent] = useTextField();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const notes = useNotes();
  const { addNote, updateNote, deleteNote } = useNoteActions();

  const existingNote = React.useMemo(() => {
    return notes.find((note) => {
      return note.day === day;
    });
  }, [notes, day]);

  React.useEffect(() => {
    if (isOpen && existingNote?.content) {
      handleContentChange(toEventLike(existingNote.content));
    }
  }, [existingNote, handleContentChange, isOpen]);

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
            userId: user.id,
            day,
            content,
          }),
          'add_note',
          setIsSaving
        ).then(handleClose);
      } else if (existingNote.content !== content) {
        void handleAsyncAction(
          updateNote(existingNote.id, {
            content,
            day,
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
    ).then(() => {
      handleClose();
    });
  };

  const handleClose = () => {
    setIsSaving(false);
    onClose();
    clearContent();
  };

  if (!day) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>
          Add a note about ${format(day || '', 'iii, LLL d, y')}
        </ModalHeader>
        <ModalBody>
          <Textarea
            onKeyDown={() => {
              return null;
            }}
            onChange={handleContentChange}
            value={content}
            placeholder="Note"
            variant="faded"
            disabled={isSaving || isRemoving}
          />
        </ModalBody>
        <ModalFooter>
          {!!existingNote && (
            <Button
              color="danger"
              onPress={handleRemove}
              isLoading={isRemoving}
              disabled={isSaving}
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
