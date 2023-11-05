"use client";
import { Grid, type Columns } from "@/components/Grid";
import { Skeleton } from "@/components/Skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { useQueryProps } from "@/hooks";
import dayjs from "@/libs/dayjs";
import { api } from "@/trpc/react";
import { type api as server } from "@/trpc/server";

type User = Awaited<ReturnType<typeof server.user.all.query>>["users"][number];

const columns: Columns<User> = [
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
];

export default function UsersPage() {
  const { pagination, sort } = useQueryProps({ queryKey: "users" });

  const { data, isLoading } = api.user.all.useQuery(
    {
      limit: pagination.limit,
      skip: pagination.skip,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sortBy: sort.sortBy as any,
      sortDirection: sort.sortDirection as "asc" | "desc",
    },
    {
      enabled: pagination.limit > 0,
    },
  );

  // const userList = useDataList({ list: data?.users ?? [] });
  const users = data?.users ?? [];

  return (
    <div className="container">
      <h1 className="text-xl">Users</h1>
      <Grid
        data={users}
        columns={columns}
        loading={isLoading}
        gridTemplate="user-grid"
        headerClass="hidden @3xl:grid"
        sort={sort}
        pagination={{ ...pagination, total: data?.totalFound ?? 0 }}
      />
    </div>
  );
}
