import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useNotesStore } from '@stores';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import React from 'react';

type NoteDialogProps = {
  open: boolean;
  onClose: () => void;
  day: string | null;
};

const NoteDialog = ({ open, onClose, day }: NoteDialogProps) => {
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

  const existingNote = day ? notes.find((note) => note.day === day) : null;

  React.useEffect(() => {
    if (existingNote?.content && !content) {
      setContent(existingNote.content);
    }
  }, [existingNote, content]);

  React.useEffect(() => {
    if (!open) {
      setContent('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user || !day || fetchingNotes) {
      return null;
    }

    if (!existingNote) {
      await addNote({
        userId: user.id,
        day,
        content,
      });
    } else {
      await updateNote(existingNote.id, {
        content,
        day,
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
          {day && `Add a note about ${format(day || '', 'iii, LLL d, y')}`}
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
