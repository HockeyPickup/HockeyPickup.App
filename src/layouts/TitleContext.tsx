import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface TitleContextType {
  title: string;
  setPageInfo: (_title: string, _description?: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export const TitleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [title, setTitle] = useState('Hockey Pickup');

  const setPageInfo = (newTitle: string, description?: string): void => {
    setTitle(newTitle);

    // Update both document title and OG title
    const displayTitle = newTitle !== 'Home' ? `Hockey Pickup - ${newTitle}` : 'Hockey Pickup';
    document.title = displayTitle;

    // Update Open Graph tags
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');

    if (ogTitle) {
      ogTitle.setAttribute('content', displayTitle);
    }
    if (ogDescription) {
      ogDescription.setAttribute('content', description ?? displayTitle);
    }
  };

  return <TitleContext.Provider value={{ title, setPageInfo }}>{children}</TitleContext.Provider>;
};

export const useTitle = (): TitleContextType => {
  const context = useContext(TitleContext);
  if (context === undefined) {
    throw new Error('useTitle must be used within a TitleProvider');
  }
  return context;
};
