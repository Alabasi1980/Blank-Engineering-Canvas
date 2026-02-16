
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
}

interface ModalContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (message: string, title?: string) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options,
        resolve
      });
    });
  }, []);

  const alert = useCallback(async (message: string, title: string = 'تنبيه') => {
      await confirm({
          title,
          message,
          confirmText: 'حسناً',
          cancelText: ' ',
          variant: 'info'
      });
  }, [confirm]);

  const handleConfirm = () => {
    if (dialogState) {
      dialogState.resolve(true);
      setDialogState(null);
    }
  };

  const handleCancel = () => {
    if (dialogState) {
      dialogState.resolve(false);
      setDialogState(null);
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      {dialogState && (
        <ConfirmDialog
          isOpen={dialogState.isOpen}
          {...dialogState.options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          cancelText={dialogState.options.cancelText === ' ' ? undefined : (dialogState.options.cancelText || 'إلغاء')}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
