'use client';

import React, { useEffect, useState, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showButtons?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Да',
  cancelText = 'Отмена',
  onConfirm,
  showButtons = true,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const autoCloseTimer = useRef<NodeJS.Timeout | null>(null);
  const animationTimer = useRef<NodeJS.Timeout | null>(null);

  // Запуск autoClose таймера
  useEffect(() => {
    if (isOpen && autoClose) {
      autoCloseTimer.current = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
    }
    
    return () => {
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
        autoCloseTimer.current = null;
      }
    };
  }, [isOpen, autoClose, autoCloseDelay]);

  // Закрытие с анимацией
  const handleClose = () => {
    if (isClosing) return;
    
    setIsClosing(true);
    
    // Очищаем autoClose таймер, если закрываем вручную
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
    
    // Ждём завершения анимации, затем вызываем onClose
    animationTimer.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
      if (animationTimer.current) clearTimeout(animationTimer.current);
    };
  }, []);

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
        transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full max-w-md
          transform transition-all duration-300 ease-out ${
            isClosing 
              ? 'scale-95 opacity-0' 
              : 'scale-100 opacity-100'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <div className="text-gray-700">{children}</div>
        </div>
        
        {showButtons && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded border border-gray-300 hover:bg-gray-100 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                handleClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;