"use client";
import { CustomLink } from "@/components/CustomLink";
import { LayoutTab } from "@/components/layout-tabs/LayoutTab";
import { LayoutTabs } from "@/components/layout-tabs/LayoutTabs";
import { LayoutMain } from "@/components/layouts/LayoutMain";
import { Button } from "@/components/ui/button";
import { type PropsWithChildren } from "react";

export default function Settings({ children }: PropsWithChildren) {
  return (
    <div className="flex divide-x">
      <div className="flex w-full max-w-[200px] flex-col gap-2 pr-4">
        <CustomLink
          href="/settings/permissions/1"
          className="hover:underline"
          activeClassName="text-primary"
        >
          Admin
        </CustomLink>
        <CustomLink
          href="/settings/permissions/2"
          className="hover:underline"
          activeClassName="text-primary"
        >
          User
        </CustomLink>
        <CustomLink
          href="/settings/permissions/3"
          className="hover:underline"
          activeClassName="text-primary"
        >
          Read Only
        </CustomLink>
        <Button variant="link" className="justify-start p-0">
          + Add New Role
        </Button>
      </div>
      <div className="flex-grow pl-4">{children}</div>
    </div>
  );
}
