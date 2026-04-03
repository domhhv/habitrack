import { Modal, Button } from '@heroui/react';

import { useConfirmationState, useConfirmationActions } from '@stores';

const ConfirmationDialog = () => {
  const {
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    description = 'This action cannot be undone.',
    isOpen,
    title = 'Are you sure?',
    variant = 'danger',
  } = useConfirmationState();
  const { approveConfirmation, rejectConfirmation } = useConfirmationActions();

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            rejectConfirmation();
          }
        }}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="font-extrabold">{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{description}</Modal.Body>
            <Modal.Footer>
              <Button variant="outline" onPress={rejectConfirmation}>
                {cancelText}
              </Button>
              <Button variant={variant} onPress={approveConfirmation}>
                {confirmText}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ConfirmationDialog;
