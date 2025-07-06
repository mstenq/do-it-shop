import { ColumnsManager } from "@/components/columns-manager";
import { DataTable } from "@/components/data-table";
import { Spacer } from "@/components/spacer";
import {
  PayScheduleColumn,
  PayScheduleSortingSchema,
  usePayScheduleColumns,
} from "@/modules/pay-schedule";
import { usePayScheduleData } from "@/modules/pay-schedule/use-pay-schedule-data";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ColumnSort } from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const defaultSearch = {
  q: "",
  columns: PayScheduleColumn.options,
  sorting: [
    { id: "year", desc: true },
    { id: "startDate", desc: true },
  ] as ColumnSort[],
  pagination: {
    pageIndex: 0,
    pageSize: 30,
  },
} as const;

export const indexSearchSchema = z
  .object({
    q: z.coerce.string().default(defaultSearch.q),
    columns: z.array(PayScheduleColumn).default(defaultSearch.columns),
    sorting: z.array(PayScheduleSortingSchema).default(defaultSearch.sorting),
    pagination: z
      .object({
        pageIndex: z.coerce
          .number()
          .default(defaultSearch.pagination.pageIndex),
        pageSize: z.coerce.number().default(defaultSearch.pagination.pageSize),
      })
      .default(defaultSearch.pagination),
  })
  .default(defaultSearch);

export const Route = createFileRoute("/pay-roll/")({
  component: RouteComponent,
  validateSearch: zodValidator(indexSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const data = usePayScheduleData();
  const { columns, groupBy } = usePayScheduleColumns();

  if (!data) return null;

  return (
    <div className="p-4">
      <DataTable
        id="/pay-roll"
        data={data}
        columns={columns}
        groupBy={groupBy}
        activeColumnIds={search.columns}
        sorting={search.sorting}
        setSorting={(sorting) => navigate({ search: { ...search, sorting } })}
        search={search.q}
        setSearch={(q) => navigate({ search: { ...search, q } })}
        className="md:max-h-[calc(100svh-192px)] print:max-h-full"
        paginator={{
          pagination: search.pagination,
          setPagination: (updater) => {
            const newPagination =
              typeof updater === "function"
                ? updater(search.pagination)
                : updater;
            navigate({
              search: { ...search, pagination: newPagination },
            });
          },
        }}
      >
        <Spacer />
        <ColumnsManager
          columns={columns}
          activeColumnIds={search.columns}
          onChangeColumns={(columns) =>
            navigate({ search: { ...search, columns } })
          }
        />
      </DataTable>
    </div>
  );
}
