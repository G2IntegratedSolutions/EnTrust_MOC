// ModalComponent.tsx
import { info } from 'console';
import React from 'react';
import Modal from 'react-modal';

interface ModalComponentProps {
  isOpen: boolean;
  onRequestClose: () => void;
  contentLabel: string;
  infoContent?: React.ReactNode;
  infoHeader?: string;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ isOpen,infoHeader, infoContent, onRequestClose, contentLabel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
    >

      {infoHeader && <h2>{infoHeader}</h2>}
      {infoContent && <div>{infoContent}</div>}
      <button className='btn btn-primary' onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default ModalComponent;