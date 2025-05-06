'use client';
import { createContext, SetStateAction, useState } from 'react';

interface MenuContext {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const ThemeContext = createContext<MenuContext>({
  isOpen: false,
  setIsOpen: () => {},
});

const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ThemeContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default MenuProvider;
