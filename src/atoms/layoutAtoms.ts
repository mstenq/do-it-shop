"use client";
import { atom, useAtom } from "jotai";

const isMobileMenuOpenAtom = atom(false);

export const useMobileMenuOpenAtom = () => {
  const [isOpen, setIsOpen] = useAtom(isMobileMenuOpenAtom);
  return {
    isOpen,
    toggle: () => setIsOpen((p) => !p),
    close: () => setIsOpen(false),
    open: () => setIsOpen(true),
  };
};
