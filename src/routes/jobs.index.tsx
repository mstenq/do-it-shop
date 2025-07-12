import { ColumnsManager } from "@/components/columns-manager";
import { CurrentFilters } from "@/components/current-filters";
import { DataTable } from "@/components/data-table";
import { Spacer } from "@/components/spacer";
import { useStandardBatchActions } from "@/hooks/use-standard-batch-actions";

import {
  JobColumn,
  JobsFilterPopover,
  JobSortingSchema,
  useJobsColumns,
  useJobsData,
} from "@/modules/jobs";
import { api } from "@convex/api";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ColumnSort } from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { z } from "zod";

const defaultSearch = {
  q: "",
  columns: JobColumn.options,
  sorting: [
    { id: "isActive", desc: true },
    { id: "name", desc: false },
  ] as ColumnSort[],
  pagination: {
    pageIndex: 0,
    pageSize: 30,
  },
  filters: {
    showDeleted: false,
  },
} as const;

export const indexSearchSchema = z
  .object({
    q: z.coerce.string().default(defaultSearch.q),
    columns: z.array(JobColumn).default(defaultSearch.columns),
    sorting: z.array(JobSortingSchema).default(defaultSearch.sorting),
    pagination: z
      .object({
        pageIndex: z.coerce
          .number()
          .default(defaultSearch.pagination.pageIndex),
        pageSize: z.coerce.number().default(defaultSearch.pagination.pageSize),
      })
      .default(defaultSearch.pagination),
    filters: z
      .object({
        showDeleted: z.boolean().default(defaultSearch.filters.showDeleted),
      })
      .default(defaultSearch.filters),
  })
  .default(defaultSearch);

export const Route = createFileRoute("/jobs/")({
  component: RouteComponent,
  validateSearch: zodValidator(indexSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  // const data = useJobsData({
  //   includeDeleted: search.filters.showDeleted,
  // });
  const data = useQuery(api.jobs.all, {
    includeDeleted: search.filters.showDeleted,
  });
  const destroy = useMutation(api.jobs.destroy);
  const restore = useMutation(api.jobs.restore);
  const { columns, groupBy, rowActions } = useJobsColumns();

  const batchActions = useStandardBatchActions({
    destroy,
    restore,
    showDeleted: search.filters.showDeleted,
  });

  if (!data) return null;

  console.log("rerender");

  return (
    <div className="p-4">
      <DataTable
        id="/jobs/$id"
        data={data}
        columns={columns}
        activeColumnIds={search.columns}
        sorting={search.sorting}
        rowActions={rowActions}
        setSorting={(sorting) => navigate({ search: { ...search, sorting } })}
        search={search.q}
        setSearch={(q) => navigate({ search: { ...search, q } })}
        className="md:max-h-[calc(100svh-192px)] print:max-h-full"
        groupBy={groupBy}
        onRowClick={(row) => {
          console.log("Row clicked:", row);
          navigate({
            to: "/jobs/$id",
            params: { id: row._id },
            search: { showEdit: "", showAdd: false },
          });
        }}
        batchActions={batchActions}
        paginator={{
          pagination: search.pagination,
          setPagination: (pagination) => {
            navigate({
              search: (o) => ({ ...o, pagination }),
            });
          },
        }}
      >
        <CurrentFilters filters={search.filters} />
        <Spacer />
        <ColumnsManager
          columns={columns}
          activeColumnIds={search.columns}
          onChangeColumns={(columns) =>
            navigate({ search: { ...search, columns } })
          }
        />
        <JobsFilterPopover />
      </DataTable>
    </div>
  );
}
