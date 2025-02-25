import {
  Button,
  ModalBody,
  ModalHeader,
  Modal,
  ModalContent,
} from '@heroui/react';
import React from 'react';

type ConfirmDialogProps = {
  open: boolean;
  heading: string;
  onCancel: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
  loading: boolean;
};

const ConfirmDialog = ({
  open,
  loading,
  heading,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={open} onClose={onCancel}>
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalBody>
          {children}
          <div className="mb-4 mt-2 flex flex-row justify-end gap-4">
            <Button
              color="secondary"
              variant="ghost"
              onClick={onCancel}
              isDisabled={loading}
              role="confirm-dialog-cancel"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={onConfirm}
              isLoading={loading}
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
