import { LayoutTab } from "@/components/layout-tabs/LayoutTab";
import { LayoutTabs } from "@/components/layout-tabs/LayoutTabs";
import { LayoutMain } from "@/components/layouts/LayoutMain";
import { type PropsWithChildren } from "react";

export default function Settings({ children }: PropsWithChildren) {
  return (
    <LayoutMain>
      <div className="p-8">
        <h1 className="pb-4 text-xl font-semibold">Settings</h1>
        <LayoutTabs>
          <LayoutTab href="/settings/account">Account</LayoutTab>
          <LayoutTab href="/settings/permissions">Permissions</LayoutTab>
        </LayoutTabs>
        <div className="py-4">{children}</div>
      </div>
    </LayoutMain>
  );
}
