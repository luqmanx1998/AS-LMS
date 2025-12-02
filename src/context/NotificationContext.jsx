import React, { createContext, useContext, useState } from 'react';
import NotificationPopup from '../ui/NotificationPopup';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [popup, setPopup] = useState(null);

  return (
    <NotificationContext.Provider value={{ popup, setPopup }}>
      {children}
      {popup && <NotificationPopup {...popup} />}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};