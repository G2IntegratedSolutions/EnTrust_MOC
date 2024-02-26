// ModalComponent.tsx
import { info } from 'console';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

interface ModalComponentProps {
  isOpen: boolean;
  onRequestClose: () => void;
  contentLabel: string;
  infoContent?: React.ReactNode;
  infoHeader?: string;
  imgSrc?: string;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ isOpen, infoHeader, infoContent, imgSrc, onRequestClose, contentLabel }) => {
  const [isModalMap, setIsModalMap] = useState("");
  useEffect(() => {
    if(imgSrc){
      setIsModalMap("modalMap");
    }
  }, [imgSrc]);


  return (
    <Modal
      className={isModalMap}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
    >

      {infoHeader && <h2>{infoHeader}</h2>}
      {infoContent && <div>{infoContent}</div>}
       {imgSrc != '' && <div><img src={imgSrc} width='298px' height='200px' alt="" /></div>} 
      <button className='btn btn-primary' onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default ModalComponent;