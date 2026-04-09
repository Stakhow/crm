import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { ReactNode } from 'react';

export function ConfirmationDialog({
    title,
    message,
    isOpen,
    children,
    handleConfirmClick,
    handleClose,
}: {
    title?: string;
    message?: string;
    isOpen: boolean;
    children?: ReactNode;
    handleConfirmClick?: () => void;
    handleClose: () => void;
}) {
    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            {!!children ? (
                children
            ) : (
                <>
                    <DialogTitle id="alert-dialog-title">{title || ''}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{message || ''}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button fullWidth variant="outlined" onClick={handleClose}>
                            Відміна
                        </Button>
                        <Button fullWidth variant="outlined" color={'error'} onClick={handleConfirmClick}>
                            Підтвердити
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
