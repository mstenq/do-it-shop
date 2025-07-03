import { ColumnsManager } from "@/components/columns-manager";
import { CurrentFilters } from "@/components/current-filters";
import { DataTable } from "@/components/data-table";
import { Spacer } from "@/components/spacer";
import { useStandardBatchActions } from "@/hooks/use-standard-batch-actions";

import {
  PositionColumn,
  PositionsFilterPopover,
  PositionSortingSchema,
  usePositionsColumns,
} from "@/modules/positions";
import { usePositionsData } from "@/modules/positions/use-positions-data";
import { api } from "@convex/api";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ColumnSort } from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation } from "convex/react";
import { z } from "zod";

const defaultSearch = {
  columns: PositionColumn.options,
  sorting: [{ id: "name", desc: false }] as ColumnSort[],
  filters: {
    showDeleted: false,
  },
} as const;

export const indexSearchSchema = z
  .object({
    columns: z.array(PositionColumn).default(defaultSearch.columns),
    sorting: z.array(PositionSortingSchema).default(defaultSearch.sorting),
    filters: z
      .object({
        showDeleted: z.boolean().default(defaultSearch.filters.showDeleted),
      })
      .default(defaultSearch.filters),
  })
  .default(defaultSearch);

export const Route = createFileRoute("/positions/")({
  component: RouteComponent,
  validateSearch: zodValidator(indexSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const data = usePositionsData({ includeDeleted: search.filters.showDeleted });
  const destroy = useMutation(api.positions.destroy);
  const restore = useMutation(api.positions.restore);
  const { columns, rowActions } = usePositionsColumns();

  const batchActions = useStandardBatchActions({
    destroy,
    restore,
    showDeleted: search.filters.showDeleted,
  });

  return (
    <div className="p-4">
      <DataTable
        id="/positions/$id"
        data={data}
        columns={columns}
        activeColumnIds={search.columns}
        sorting={search.sorting}
        rowActions={rowActions}
        setSorting={(sorting) => navigate({ search: { ...search, sorting } })}
        className="md:max-h-[calc(100svh-192px)] print:max-h-full"
        onRowClick={(row) =>
          navigate({ to: "/positions", params: { showEdit: row.id } })
        }
        batchActions={batchActions}
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
        <PositionsFilterPopover />
      </DataTable>
    </div>
  );
}
