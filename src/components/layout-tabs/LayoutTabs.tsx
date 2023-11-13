import { type PropsWithChildren } from "react";

export const LayoutTabs = ({ children }: PropsWithChildren) => {
  return <div className="flex border-b-2">{children}</div>;
};
