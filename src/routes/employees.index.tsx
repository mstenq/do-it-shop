import { ColumnsManager } from "@/components/columns-manager";
import { CurrentFilters } from "@/components/current-filters";
import { DataTable } from "@/components/data-table";
import { Spacer } from "@/components/spacer";
import { useStandardBatchActions } from "@/hooks/use-standard-batch-actions";

import {
  EmployeeColumn,
  EmployeesFilterPopover,
  EmployeeSortingSchema,
  useEmployeesColumns,
} from "@/modules/employees";
import { useEmployeesData } from "@/modules/employees/use-employees-data";
import { api } from "@convex/api";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ColumnSort } from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation } from "convex/react";
import { z } from "zod";

const defaultSearch = {
  q: "",
  columns: EmployeeColumn.options,
  sorting: [{ id: "id", desc: false }] as ColumnSort[],
  pagination: {
    pageIndex: 0,
    pageSize: 30,
  },
  filters: {
    department: "",
    level: "",
    grade: "",
    showDeleted: false,
  },
} as const;

export const indexSearchSchema = z
  .object({
    q: z.coerce.string().default(defaultSearch.q),
    columns: z.array(EmployeeColumn).default(defaultSearch.columns),
    sorting: z.array(EmployeeSortingSchema).default(defaultSearch.sorting),
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
        department: z.string().default(defaultSearch.filters.department),
        level: z.string().default(defaultSearch.filters.level),
        grade: z.string().default(defaultSearch.filters.grade),
        showDeleted: z.boolean().default(defaultSearch.filters.showDeleted),
      })
      .default(defaultSearch.filters),
  })
  .default(defaultSearch);

export const Route = createFileRoute("/employees/")({
  component: RouteComponent,
  validateSearch: zodValidator(indexSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const data = useEmployeesData({
    includeDeleted: search.filters.showDeleted,
  });
  const destroy = useMutation(api.employees.destroy);
  const restore = useMutation(api.employees.restore);
  const { columns, groupBy, rowActions } = useEmployeesColumns();

  const batchActions = useStandardBatchActions({
    destroy,
    restore,
    showDeleted: search.filters.showDeleted,
  });

  if (!data) return null;

  return (
    <div className="p-4">
      <DataTable
        id="/employees/$id"
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
          navigate({
            to: "/employees/$id",
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
        <EmployeesFilterPopover />
      </DataTable>
    </div>
  );
}
