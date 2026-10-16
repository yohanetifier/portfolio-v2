'use client';
import { createContext, SetStateAction, useState } from 'react';

interface MenuContext {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  /** Les images de l'éventail sont au-dessus du voile (ouverture → fin du retour) */
  fanRaised: boolean;
  setFanRaised: React.Dispatch<SetStateAction<boolean>>;
}

export const ThemeContext = createContext<MenuContext>({
  isOpen: false,
  setIsOpen: () => {},
  fanRaised: false,
  setFanRaised: () => {},
});

const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fanRaised, setFanRaised] = useState(false);
  return (
    <ThemeContext.Provider
      value={{ isOpen, setIsOpen, fanRaised, setFanRaised }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default MenuProvider;
