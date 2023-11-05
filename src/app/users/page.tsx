"use client";
import { Grid, type Columns } from "@/components/Grid";
import { Pagination } from "@/components/Pagination";
import { Skeleton } from "@/components/Skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { useQueryState } from "@/hooks";
import dayjs from "@/libs/dayjs";
import { api } from "@/trpc/react";
import { useMemo } from "react";

type UseDataListProps<T> = {
  list: T[];
};

const useDataList = <T,>({ list }: UseDataListProps<T>) => {
  return list;
};

export default function UsersPage() {
  const [limit] = useQueryState<number>("limit-users", 10, {
    formatValue: (v: string) => Number(v),
  });
  const [skip] = useQueryState<number>("skip-users", 0, {
    formatValue: (v: string) => Number(v),
  });

  const { data, isLoading } = api.user.all.useQuery(
    {
      limit: limit,
      skip: Number(skip),
      sortBy: "lastUpdated",
      sortDirection: "asc",
    },
    {
      enabled: limit > 0,
    },
  );

  const userList = useDataList({ list: data?.users ?? [] });

  const columns: Columns<(typeof userList)[number]> = useMemo(
    () => [
      {
        sharedClassName: "row-span-2 @3xl:row-span-1",
        fallback: <Skeleton.Circle />,
        cell: (user) => <UserAvatar className="" user={user} />,
      },
      {
        header: "Name",
        sharedClassName: "font-semibold text-accent-foreground",
        fallback: <Skeleton.Text wordCount={2} />,
        cell: (user) => `${user.firstName} ${user.lastName}`,
      },
      {
        header: "Email",
        sharedClassName: "",
        fallback: <Skeleton.Text wordCount={4} />,
        cell: (user) => user.email,
      },
      {
        header: "Role",
        sharedClassName: "text-right",
        fallback: <Skeleton.Text wordCount={1} />,
        cell: (user) => (
          <p className="hidden font-semibold capitalize text-accent-foreground @sm:block @3xl:font-normal @3xl:text-muted-foreground">
            {user.role}
          </p>
        ),
      },
      {
        header: "Last Updated",
        sharedClassName: "hidden text-right @sm:block",
        fallback: <Skeleton.Text wordCount={2} />,
        cell: (user) => (
          <p className="hidden text-right @sm:block ">
            <span className="inline @3xl:hidden">updated</span>{" "}
            {dayjs.utc(user.updatedAt).fromNow()}{" "}
          </p>
        ),
      },
    ],
    [],
  );

  return (
    <div className="container">
      <h1 className="text-xl">Users</h1>
      <Grid
        data={userList}
        columns={columns}
        loading={isLoading}
        totalFound={data?.totalFound ?? 0}
        queryKey="-users"
        gridTemplate="user-grid"
        headerClass="hidden @3xl:grid"
      />
    </div>
  );
}
