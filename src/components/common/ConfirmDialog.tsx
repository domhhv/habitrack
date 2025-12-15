import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  ModalContent,
} from '@heroui/react';
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
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalBody>
          {children}
          <div className="mt-2 mb-4 flex flex-row justify-end gap-4">
            <Button
              variant="ghost"
              color="secondary"
              onPress={onCancel}
              isDisabled={isLoading}
              role="confirm-dialog-cancel"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={onConfirm}
              isLoading={isLoading}
              role="confirm-dialog-confirm"
            >
              Confirm
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDialog;
