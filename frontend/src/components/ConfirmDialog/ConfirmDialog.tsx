import './ConfirmDialog.css';
import ElementRow from '@components/ElementRow/ElementRow';
import Button from '@components/Button/Button';
import TextHeading from '@components/TextHeading/TextHeading';
import TextLabel from '@components/TextLabel/TextLabel';
import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  open: boolean;
  dangerous?: boolean;
  onClosed: (confirmed: boolean) => void;
}

export default function ConfirmDialog({
  title,
  message,
  open,
  onClosed,
  dangerous,
}: ConfirmDialogProps) {
  let dialog: React.RefObject<HTMLDialogElement | null> = useRef(null);

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [open, dialog]);

  return (
    <dialog className='confirm-dialog' ref={dialog}>
      <TextHeading level={2}>{title}</TextHeading>
      <TextLabel>{message}</TextLabel>
      <ElementRow>
        <Button variant='secondary' onClick={() => onClosed(false)}>
          Anuluj
        </Button>
        <Button
          variant={dangerous ? 'danger' : 'primary'}
          onClick={() => onClosed(true)}
        >
          Potwierdź
        </Button>
      </ElementRow>
    </dialog>
  );
}
