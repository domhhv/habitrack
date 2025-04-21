import { handleAsyncAction } from '@helpers';
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useUser } from '@hooks';
import { useNotes, useNoteActions } from '@stores';
import { getErrorMessage } from '@utils';
import { format } from 'date-fns';
import React from 'react';

type NoteDialogProps = {
  open: boolean;
  onClose: () => void;
  date: Date;
};

const NoteDialog = ({ open, onClose, date }: NoteDialogProps) => {
  const { user } = useUser();
  const [content, setContent] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const notes = useNotes();
  const { addNote, updateNote, deleteNote } = useNoteActions();

  const month =
    date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const sqlDate = `${date.getFullYear()}-${month}-${day}`;

  const existingNote = React.useMemo(() => {
    return date
      ? notes.find((note) => {
          return note.day === sqlDate;
        })
      : null;
  }, [notes, sqlDate, date]);

  React.useEffect(() => {
    if (open && existingNote?.content) {
      setContent(existingNote.content);
    }
  }, [existingNote, open]);

  React.useEffect(() => {
    if (!open) {
      setContent('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user || !date) {
      return null;
    }

    setIsSaving(true);

    if (content) {
      if (!existingNote) {
        handleAsyncAction(
          () => {
            return addNote({
              userId: user.id,
              day: sqlDate,
              content,
            });
          },
          'add_note',
          setIsSaving
        ).then(() => {
          handleClose();
        });
      } else if (existingNote.content !== content) {
        try {
          await updateNote(existingNote.id, {
            content,
            day: sqlDate,
          });

          addToast({
            title: 'Note updated successfully',
            color: 'success',
          });

          handleClose();
        } catch (error) {
          console.error(error);
          addToast({
            title: 'Something went wrong while updating your note',
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
          });
        }
      }
    }
  };

  const handleDelete = async () => {
    if (!existingNote) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteNote(existingNote.id);

      addToast({
        title: 'Note deleted successfully',
        color: 'success',
      });

      handleClose();
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Something went wrong while deleted your note',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });
    } finally {
      setIsDeleting(true);
    }
  };

  const handleClose = () => {
    setIsSaving(false);
    onClose();
    setTimeout(() => {
      setContent('');
    });
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>
          {date && `Add a note about ${format(date || '', 'iii, LLL d, y')}`}
        </ModalHeader>
        <ModalBody>
          <Textarea
            onKeyDown={() => {
              return null;
            }}
            onValueChange={setContent}
            value={content}
            placeholder="Note"
            variant="faded"
          />
        </ModalBody>
        <ModalFooter>
          {!!existingNote && (
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          )}
          <Button
            type="submit"
            color="primary"
            isLoading={isSaving}
            onPress={handleSubmit}
            isDisabled={!content}
          >
            {existingNote ? 'Save' : 'Add'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NoteDialog;
