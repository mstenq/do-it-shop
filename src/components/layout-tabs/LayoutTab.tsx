import { type PropsWithChildren } from "react";
import { CustomLink, CustomLinkProps } from "../CustomLink";

export const LayoutTab = ({ children, ...props }: CustomLinkProps) => {
  return (
    <CustomLink
      {...props}
      className="-mb-0.5 flex px-6 py-2 text-muted-foreground"
      activeClassName="border-b border-b-primary border-b-2 text-black dark:text-white"
    >
      {children}
    </CustomLink>
  );
};
