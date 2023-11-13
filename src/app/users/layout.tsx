"use client";
import { LayoutMasterDetail } from "@/components/layouts/LayoutMasterDetail";
import { type PropsWithChildren } from "react";
import { UserGrid } from "./UserGrid";

export default function UsersPageLayout({ children }: PropsWithChildren) {
  return (
    <LayoutMasterDetail
      gridOnlyPath="/users"
      gridTitle="Users"
      grid={<UserGrid />}
      detail={children}
    />
  );
}
