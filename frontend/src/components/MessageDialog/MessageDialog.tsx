import './MessageDialog.css';
import Button from '@components/Button/Button';
import TextHeading from '@components/TextHeading/TextHeading';
import TextLabel from '@components/TextLabel/TextLabel';
import React, { useEffect, useRef } from 'react';

interface MessageDialogProps {
  title: string;
  message: string;
  open: boolean;
  onClosed: () => void;
}

export default function MessageDialog({
  title,
  message,
  open,
  onClosed,
}: MessageDialogProps) {
  let dialog: React.RefObject<HTMLDialogElement | null> = useRef(null);

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [open, dialog]);

  return (
    <dialog className='message-dialog' ref={dialog}>
      <TextHeading level={2}>{title}</TextHeading>
      <TextLabel>{message}</TextLabel>
      <Button onClick={() => onClosed()}>Ok</Button>
    </dialog>
  );
}
