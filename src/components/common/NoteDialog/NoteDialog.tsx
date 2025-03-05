import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useUser } from '@hooks';
import { useNotesStore } from '@stores';
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
  const {
    addingNote,
    addNote,
    notes,
    fetchingNotes,
    updateNote,
    updatingNote,
    deleteNote,
    deletingNote,
  } = useNotesStore();

  const month =
    date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const sqlDate = `${date.getFullYear()}-${month}-${day}`;

  const existingNote = React.useMemo(() => {
    return date ? notes.find((note) => note.day === sqlDate) : null;
  }, [notes, sqlDate, date]);

  React.useEffect(() => {
    if (existingNote?.content) {
      setContent(existingNote.content);
    }
  }, [existingNote]);

  React.useEffect(() => {
    if (!open) {
      setContent('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user || !date || fetchingNotes) {
      return null;
    }

    handleClose();

    if (content) {
      if (!existingNote) {
        await addNote({
          userId: user.id,
          day: sqlDate,
          content,
        });
      } else if (existingNote.content !== content) {
        await updateNote(existingNote.id, {
          content,
          day: sqlDate,
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!existingNote) {
      return;
    }

    await deleteNote(existingNote.id);

    handleClose();
  };

  const handleClose = () => {
    setTimeout(() => setContent(''));
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>
          {date && `Add a note about ${format(date || '', 'iii, LLL d, y')}`}
        </ModalHeader>
        <ModalBody>
          <Textarea
            onKeyDown={() => null}
            onValueChange={setContent}
            value={content}
            placeholder="Note"
            variant="faded"
            disabled={fetchingNotes}
          />
        </ModalBody>
        <ModalFooter>
          {!!existingNote && (
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={deletingNote}
            >
              Delete
            </Button>
          )}
          <Button
            type="submit"
            color="primary"
            isLoading={addingNote || updatingNote}
            onPress={handleSubmit}
            isDisabled={!content || fetchingNotes}
          >
            {existingNote ? 'Save' : 'Add'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NoteDialog;
