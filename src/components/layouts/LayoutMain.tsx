"use client";

type Props = {
  children: React.ReactNode;
};

export const LayoutMain = ({ children }: Props) => {
  return (
    <main className="scroll col-span-2 max-h-[--content-height] overflow-y-auto">
      {children}
    </main>
  );
};
