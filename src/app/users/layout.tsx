"use client";
import { CustomLink } from "@/components/CustomLink";
import { DataGrid, type Columns } from "@/components/DataGrid";
import { Skeleton } from "@/components/Skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { FacetedFilter } from "@/components/filters/FacetedFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePaginationSortProps, useStateSet } from "@/hooks";
import { useDebouncedState } from "@/hooks/useDebouncedState";
import dayjs from "@/libs/dayjs";
import { api } from "@/trpc/react";
import { type api as server } from "@/trpc/server";
import { cn } from "@/utils";
import { XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { type PropsWithChildren } from "react";

type User = Awaited<ReturnType<typeof server.user.all.query>>["users"][number];

const columns: Columns<User, "name" | "email" | "role" | "lastUpdated"> = [
  {
    sharedClassName: "row-span-2 @3xl:row-span-1",
    fallback: <Skeleton.Circle />,
    cell: (user) => <UserAvatar className="" user={user} />,
  },
  {
    header: "Name",
    sharedClassName: "font-semibold text-accent-foreground",
    fallback: <Skeleton.Text wordCount={2} />,
    sortKey: "name",
    cell: (user) => (
      <CustomLink
        href={`/users/${user.id}`}
        className="text-primary hover:underline"
      >
        {user.firstName} {user.lastName}
      </CustomLink>
    ),
  },
  {
    header: "Email",
    sharedClassName: "",
    fallback: <Skeleton.Text wordCount={4} />,
    sortKey: "email",
    cell: (user) => user.email,
  },
  {
    header: "Role",
    sharedClassName: "text-right",
    fallback: <Skeleton.Text wordCount={1} />,
    sortKey: "role",
    cell: (user) => (
      <p className="hidden font-semibold capitalize text-accent-foreground @sm:block @3xl:font-normal @3xl:text-muted-foreground">
        {user.role}
      </p>
    ),
  },
  {
    header: "Last Updated",
    sharedClassName: "text-right",
    fallback: <Skeleton.Text wordCount={2} />,
    sortKey: "lastUpdated",
    cell: (user) => (
      <p className="hidden text-right @sm:block ">
        <span className="inline @3xl:hidden">updated</span>{" "}
        {dayjs.utc(user.updatedAt).fromNow()}{" "}
      </p>
    ),
  },
];

export default function UsersPageLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { pagination, sort } = usePaginationSortProps({ queryKey: "users" });
  const [search, debouncedSearch, setSearch] = useDebouncedState("");
  const roleSet = useStateSet<string>([]);

  const hasFilters = roleSet.values.length > 0 || debouncedSearch.length > 0;

  const resetFilters = () => {
    roleSet.clear();
    setSearch("");
  };

  const { data, isLoading } = api.user.all.useQuery(
    {
      limit: pagination.limit,
      skip: pagination.skip,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sortBy: sort.sortBy as any,
      sortDirection: sort.sortDirection as "asc" | "desc",
      search: debouncedSearch,
      roles: roleSet.values,
    },
    {
      enabled: pagination.limit > 0,
    },
  );

  // const userList = useDataList({ list: data?.users ?? [] });
  const users = data?.users ?? [];

  return (
    <div className="flex">
      <div
        className={cn(
          "scroll h-screen w-full overflow-y-auto",
          pathname !== "/users" && " hidden w-[350px] resize-x 2xl:block",
        )}
      >
        {pathname === "/users" && (
          <div className="p-4 ">
            <h1 className="text-xl">Users</h1>
          </div>
        )}
        <div className="w-full"></div>

        <DataGrid
          queryKey="users"
          data={users}
          columns={columns}
          loading={isLoading}
          gridTemplate="user-grid"
          totalFound={data?.totalFound ?? undefined}
          toolbar={
            <div className="flex flex-col-reverse items-center justify-between gap-2 @md:flex-row">
              <div className="flex w-full gap-2 @md:w-auto">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FacetedFilter
                  title="Role"
                  value={roleSet}
                  options={[
                    { label: "User", value: "user" },
                    { label: "Admin", value: "admin" },
                    { label: "System Admin", value: "system_admin" },
                  ]}
                />
                {hasFilters && (
                  <Button
                    onClick={resetFilters}
                    variant="ghost"
                    size="xs"
                    title="Clear Search"
                  >
                    <span className="hidden @md:block">Reset</span>
                    <XIcon className="w-4 pt-1" />
                  </Button>
                )}
              </div>
              <Button className="w-full @md:w-auto">Add User</Button>
            </div>
          }
        />
      </div>
      {children}
    </div>
  );
}