"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({
  isOpen,
  onClose,
  children,
  className,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full rounded-lg bg-white shadow-xl',
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({
  children,
  className,
  showCloseButton = true,
  onClose,
}: ModalHeaderProps) => (
  <div className={cn('flex items-center justify-between p-6 border-b', className)}>
    <div className="flex-1">{children}</div>
    {showCloseButton && (
      <button
        onClick={onClose}
        className="ml-4 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    )}
  </div>
);

const ModalBody = ({ children, className }: ModalBodyProps) => (
  <div className={cn('p-6', className)}>{children}</div>
);

const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div className={cn('flex items-center justify-end gap-3 p-6 border-t bg-gray-50', className)}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };
