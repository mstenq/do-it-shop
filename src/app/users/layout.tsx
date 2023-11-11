"use client";
import { MasterDetail } from "@/components/LayoutMasterDetail";
import { type PropsWithChildren } from "react";
import { UserGrid } from "./UserGrid";

export default function UsersPageLayout({ children }: PropsWithChildren) {
  return (
    <MasterDetail
      gridOnlyPath="/users"
      gridTitle="Users"
      grid={<UserGrid />}
      detail={children}
    />
  );
}
