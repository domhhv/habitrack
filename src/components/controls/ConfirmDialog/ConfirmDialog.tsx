import {
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy';
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
    <Modal open={open} onClose={onCancel}>
      <ModalDialog>
        <ModalClose />
        <DialogTitle>{heading}</DialogTitle>
        <DialogContent>
          <Typography>{children}</Typography>
        </DialogContent>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} loading={loading}>
          Confirm
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default ConfirmDialog;
