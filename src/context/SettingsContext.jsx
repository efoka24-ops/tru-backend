import React, { createContext, useContext } from 'react';
import { useSettings } from '../hooks/useSettings';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const settings = useSettings();

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within SettingsProvider');
  }
  return context;
}
