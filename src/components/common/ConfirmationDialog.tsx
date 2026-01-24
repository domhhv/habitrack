import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
} from '@heroui/react';

import { useConfirmationState, useConfirmationActions } from '@stores';

const ConfirmationDialog = () => {
  const {
    cancelText = 'Cancel',
    color = 'danger',
    confirmText = 'Confirm',
    description = 'This action cannot be undone.',
    isOpen,
    title = 'Are you sure?',
  } = useConfirmationState();
  const { approveConfirmation, rejectConfirmation } = useConfirmationActions();

  return (
    <Modal isOpen={isOpen} onClose={rejectConfirmation}>
      <ModalContent>
        <ModalHeader className="font-extrabold">{title}</ModalHeader>
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            color="secondary"
            onPress={rejectConfirmation}
          >
            {cancelText}
          </Button>
          <Button color={color} onPress={approveConfirmation}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationDialog;
