"use client";

import { api } from "@/trpc/react";

export const DbUpdater = ({
  currentVersion,
  latestVersion,
}: {
  currentVersion: number | null;
  latestVersion: number | null;
}) => {
  const { mutate: migrate } = api.turso.migrateDB.useMutation({
    onSuccess() {
      window.location.reload();
    },
  });
  if (currentVersion === null || latestVersion === null) {
    return null;
  }

  if (currentVersion >= latestVersion) {
    return null;
  }

  return (
    <button
      onClick={() => {
        if (confirm("Are you sure you want to upgrade?")) {
          migrate();
        }
      }}
      className="bg-card group ml-2 flex w-[120px] items-center rounded-full p-1 shadow"
    >
      <span className="bg-primary animate-pulse rounded-full px-2 py-0.5 text-white">
        v.{latestVersion}
      </span>
      <span className="w-full text-center group-hover:hidden">available</span>
      <span className="text-primary hidden w-full text-center group-hover:block">
        update now
      </span>
    </button>
  );
};
