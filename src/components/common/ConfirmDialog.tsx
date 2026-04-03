import { Modal, Button, Spinner } from '@heroui/react';
import React from 'react';

type ConfirmDialogProps = {
  children: React.ReactNode;
  heading: string;
  isLoading: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDialog = ({
  children,
  heading,
  isLoading,
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onCancel();
          }
        }}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{heading}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {children}
              <div className="mt-2 mb-4 flex flex-row justify-end gap-4">
                <Button
                  variant="outline"
                  onPress={onCancel}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onPress={onConfirm}
                  isDisabled={isLoading}
                >
                  {isLoading && <Spinner size="sm" />}
                  Confirm
                </Button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ConfirmDialog;
