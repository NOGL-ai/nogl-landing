import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context
interface TopBarContextProps {
  toggleTop: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default undefined value
const TopBarContext = createContext<TopBarContextProps | undefined>(undefined);

// Hook to use the TopBarContext
export const useTopBarContext = (): TopBarContextProps => {
  const context = useContext(TopBarContext);
  if (!context) {
    throw new Error("useTopBarContext must be used within a TopBarProvider");
  }
  return context;
};

// Provider component
interface TopBarProviderProps {
  children: ReactNode;
}

export const TopBarProvider: React.FC<TopBarProviderProps> = ({ children }) => {
  const [toggleTop, setToggle] = useState<boolean>(true);

  return (
    <TopBarContext.Provider value={{ toggleTop, setToggle }}>
      {children}
    </TopBarContext.Provider>
  );
};
