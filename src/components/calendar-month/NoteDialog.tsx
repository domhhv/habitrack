import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@nextui-org/react';
import { useNotesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import React, { type MouseEventHandler } from 'react';

type NoteDialogProps = {
  open: boolean;
  onClose: () => void;
  date: Date | null;
};

const NoteDialog = ({ open, onClose, date }: NoteDialogProps) => {
  const user = useUser();
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

  const existingNote = notes.find((note) => {
    if (!date) {
      return;
    }

    const [day] = date.toISOString().split('T');
    return note.day === day;
  });

  React.useEffect(() => {
    if (existingNote?.content && !content) {
      setContent(existingNote.content);
    }
  }, [existingNote, content]);

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    if (!user || !date || fetchingNotes) {
      return null;
    }

    const [day] = new Date(date).toISOString().split('T');

    if (!existingNote) {
      await addNote({
        userId: user.id,
        day,
        content,
      });
    } else {
      await updateNote(existingNote.id, {
        content,
      });
    }

    handleClose();
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
              onClick={handleDelete}
              isLoading={deletingNote}
            >
              Delete
            </Button>
          )}
          <Button
            type="submit"
            color="primary"
            isLoading={addingNote || updatingNote}
            onClick={handleSubmit}
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
