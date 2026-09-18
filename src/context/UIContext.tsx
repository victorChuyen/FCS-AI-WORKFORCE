import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AppNotification {
  message: string;
  type: 'success' | 'info' | 'warning';
  action?: { label: string; onClick: () => void };
}

export interface UIContextType {
  showDocsModal: boolean;
  setShowDocsModal: (open: boolean) => void;
  showCreateWorkerModal: boolean;
  setShowCreateWorkerModal: (open: boolean) => void;
  showGuideModal: boolean;
  setShowGuideModal: (open: boolean) => void;
  notification: AppNotification | null;
  showNotification: (
    message: string,
    type?: 'success' | 'info' | 'warning',
    action?: { label: string; onClick: () => void }
  ) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const showNotification = useCallback(
    (
      message: string,
      type: 'success' | 'info' | 'warning' = 'info',
      action?: { label: string; onClick: () => void }
    ) => {
      setNotification({ message, type, action });
      setTimeout(() => {
        setNotification(prev => (prev?.message === message ? null : prev));
      }, 5000);
    },
    []
  );

  return (
    <UIContext.Provider
      value={{
        showDocsModal,
        setShowDocsModal,
        showCreateWorkerModal,
        setShowCreateWorkerModal,
        showGuideModal,
        setShowGuideModal,
        notification,
        showNotification,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
