'use client';
import React, { createContext, useState, ReactNode, useContext } from 'react';

interface FullscreenContextType {
  isFullscreenVisible: boolean;
  toggleFullscreen: () => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(
  undefined,
);

export const FullscreenProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreenVisible((prev) => !prev);
  };

  return (
    <FullscreenContext.Provider
      value={{ isFullscreenVisible, toggleFullscreen }}
    >
      {children}
    </FullscreenContext.Provider>
  );
};

export const useFullscreenContext = (): FullscreenContextType => {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error(
      'useFullscreenContext must be used within a FullscreenProvider',
    );
  }
  return context;
};
