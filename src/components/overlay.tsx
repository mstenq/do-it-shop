// DialogContext.tsx
import React, { createContext, useState, ReactNode, use } from "react";

interface OverlayType {
  component: ReactNode | null;
  show: (component: ReactNode) => void;
  close: () => void;
}

export const OverlayContext = createContext<OverlayType>({
  component: null,
  show: () => {},
  close: () => {},
});

export const OverlayProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [component, setComponent] = useState<ReactNode | null>(null);

  const show = (component: ReactNode) => {
    setComponent(component);
  };

  const close = () => {
    setComponent(null);
  };

  return (
    <OverlayContext.Provider value={{ component, show, close }}>
      {children}
      {component && <div className="dialog-overlay">{component}</div>}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = use(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within a OverlayProvider");
  }
  return context;
};
