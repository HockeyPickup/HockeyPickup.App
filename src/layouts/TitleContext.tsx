import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface TitleContextType {
  title: string;
  setTitle: (_title: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export const TitleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [title, setTitle] = useState('');

  return <TitleContext.Provider value={{ title, setTitle }}>{children}</TitleContext.Provider>;
};

export const useTitle = (): TitleContextType => {
  const context = useContext(TitleContext);
  if (context === undefined) {
    throw new Error('useTitle must be used within a TitleProvider');
  }
  return context;
};
