import {
  ColumnDef,
  FilterFn,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import autoAnimate from "@formkit/auto-animate";
import { rankItem } from "@tanstack/match-sorter-utils";
import { Spacer } from "./spacer";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  RowActionsConfig,
  RowActionsDropdown,
  RowActionsContextMenu,
} from "./data-table-row-actions";
import { get } from "http";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type BatchAction<T extends { _id: string }> = {
  buttonProps: React.ComponentProps<typeof Button>;
  onClick: (rows: T[], resetRowSelection: () => void) => void;
};

type GroupByParam<T> = Record<
  string,
  {
    grouper: (row: T) => string;
    spanAvailable?: boolean;
    above?: (rows: T[], depth?: number) => React.ReactNode;
    below?: (rows: T[], depth?: number) => React.ReactNode;
  }
>;

type Props<T extends { _id: string }> = {
  id: string;
  data: T[];
  columns: ColumnDef<T>[];
  batchActions?: BatchAction<T>[];
  rowActions?: RowActionsConfig<T>;
  onRowClick?: (row: T) => void;
  className?: string;
  children?: React.ReactNode;
  activeColumnIds?: string[];
  sorting?: SortingState;
  setSorting?: (sorting: SortingState) => void;
  search?: string;
  setSearch?: (search: string) => void;
  hideSearch?: boolean;
  groupBy?: GroupByParam<T>;
  paginator?: {
    pagination: PaginationState;
    setPagination: OnChangeFn<PaginationState> | undefined;
  };
};

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value, {
    keepDiacritics: false,
  });
  addMeta({ itemRank });
  return itemRank.passed;
};

// Custom hooks for state management
function useSortingState(
  initialSorting?: SortingState,
  setSorting?: (sorting: SortingState) => void
) {
  const [localSorting, setLocalSorting] = React.useState<SortingState>(
    initialSorting ?? []
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSorting?.(localSorting);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSorting, setSorting]);

  React.useEffect(() => {
    if (initialSorting) {
      setLocalSorting(initialSorting);
    }
  }, [initialSorting]);

  return [localSorting, setLocalSorting] as const;
}

function useGlobalFilter(
  initialSearch?: string,
  setSearch?: (search: string) => void
) {
  const [globalFilter, setGlobalFilter] = React.useState(initialSearch ?? "");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch?.(globalFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [globalFilter, setSearch]);

  React.useEffect(() => {
    setGlobalFilter(initialSearch ?? "");
  }, [initialSearch]);

  return [globalFilter, setGlobalFilter] as const;
}

// Reusable components
type SelectionCheckboxProps = {
  checked: boolean | "indeterminate";
  onCheckedChange: (value: boolean) => void;
  "aria-label": string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

const SelectionCheckbox = React.memo<SelectionCheckboxProps>(
  ({ checked, onCheckedChange, className, onClick, ...props }) => (
    <div className="flex items-center h-full ">
      <Checkbox
        className={cn("", className)}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(!!value)}
        onClick={onClick}
        {...props}
      />
    </div>
  )
);
SelectionCheckbox.displayName = "SelectionCheckbox";

type TableCellWithPaddingProps = {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  paddingDepth?: number;
  isFirstContentColumn?: boolean;
  style?: React.CSSProperties;
};

const TableCellWithPadding = React.memo<TableCellWithPaddingProps>(
  ({
    children,
    className,
    colSpan,
    paddingDepth = 0,
    isFirstContentColumn = false,
    style,
    ...props
  }) => {
    const paddingLeft =
      isFirstContentColumn && paddingDepth > 0
        ? `${paddingDepth * 16 + 8}px`
        : undefined;

    return (
      <TableCell
        className={cn("capitalize whitespace-nowrap", className)}
        colSpan={colSpan}
        style={{ ...style, paddingLeft }}
        {...props}
      >
        {children}
      </TableCell>
    );
  }
);
TableCellWithPadding.displayName = "TableCellWithPadding";

type GroupCheckboxProps<T extends { _id: string }> = {
  groupRows: Row<T>[];
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<{}>>;
  hasBatchActions: boolean;
};

const GroupCheckbox = React.memo<GroupCheckboxProps<any>>(
  ({ groupRows, rowSelection, setRowSelection, hasBatchActions }) => {
    const groupRowIds = React.useMemo(
      () => groupRows.map((r) => r.id),
      [groupRows]
    );
    const selectedInGroup = React.useMemo(
      () => groupRowIds.filter((id) => rowSelection[id]),
      [groupRowIds, rowSelection]
    );

    const isAllSelected =
      selectedInGroup.length === groupRowIds.length && groupRowIds.length > 0;
    const isIndeterminate =
      selectedInGroup.length > 0 && selectedInGroup.length < groupRowIds.length;

    const handleCheckedChange = React.useCallback(
      (value: boolean) => {
        setRowSelection((prev) => {
          const newSelection = { ...prev } as Record<string, boolean>;
          groupRowIds.forEach((id) => {
            if (value) {
              newSelection[id] = true;
            } else {
              delete newSelection[id];
            }
          });
          return newSelection;
        });
      },
      [groupRowIds, setRowSelection]
    );

    if (!hasBatchActions) return null;

    return (
      <TableCellWithPadding className="bg-muted">
        <SelectionCheckbox
          checked={isIndeterminate ? "indeterminate" : isAllSelected}
          onCheckedChange={handleCheckedChange}
          aria-label="Select group"
          className=""
        />
      </TableCellWithPadding>
    );
  }
);
GroupCheckbox.displayName = "GroupCheckbox";

type GroupRowProps<T extends { _id: string }> = {
  groupRows: Row<T>[];
  groupContent: React.ReactNode;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<{}>>;
  hasBatchActions: boolean;
  columnsLength: number;
  keyPrefix: string;
  spanAvailable?: boolean;
};

const GroupRow = React.memo<GroupRowProps<any>>(
  ({
    groupRows,
    groupContent,
    rowSelection,
    setRowSelection,
    hasBatchActions,
    columnsLength,
    keyPrefix,
    spanAvailable = true,
  }) => (
    <TableRow key={keyPrefix}>
      <GroupCheckbox
        groupRows={groupRows}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        hasBatchActions={hasBatchActions}
      />
      {spanAvailable && (
        <TableCellWithPadding
          colSpan={hasBatchActions ? columnsLength - 1 : columnsLength}
          className="font-semibold bg-muted"
        >
          {groupContent}
        </TableCellWithPadding>
      )}
      {!spanAvailable && <>{groupContent}</>}
    </TableRow>
  )
);
GroupRow.displayName = "GroupRow";

export function DataTable<T extends { _id: string }>({
  id,
  data,
  batchActions,
  columns,
  rowActions,
  onRowClick,
  className,
  activeColumnIds,
  sorting,
  setSorting,
  children,
  search,
  setSearch,
  hideSearch = false,
  groupBy,
  paginator,
}: Props<T>) {
  "use no memo";

  const [localSorting, setLocalSorting] = useSortingState(sorting, setSorting);
  console.log(localSorting);
  const [globalFilter, setGlobalFilter] = useGlobalFilter(search, setSearch);

  const columnVisibility = React.useMemo(() => {
    return columns.reduce((acc, column) => {
      let visible = activeColumnIds
        ? activeColumnIds.includes(column.id!)
        : true;
      if (column.meta?.alwaysVisible) {
        visible = true;
      }
      acc[column.id!] = visible;
      return acc;
    }, {} as VisibilityState);
  }, [columns, activeColumnIds]);

  const [rowSelection, setRowSelection] = React.useState({});
  const hasBatchActions = Boolean(batchActions?.length);

  const updatedColumns = React.useMemo(() => {
    let columnsToUse = [...columns];

    // Add row actions column if configured and showDropdownButton is not false
    if (rowActions && rowActions.showDropdownButton !== false) {
      const actionsColumn: ColumnDef<T> = {
        id: "row-actions",
        header: "",
        size: 50,
        meta: {
          alwaysVisible: true,
        },
        cell: ({ row }) => (
          <RowActionsDropdown
            row={row.original}
            config={rowActions}
            className="flex justify-end pr-2"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      };
      columnsToUse.push(actionsColumn);
    }

    if (!hasBatchActions) return columnsToUse;

    const selectColumn: ColumnDef<T> = {
      id: "select",
      size: 20,
      header: ({ table }) => (
        <SelectionCheckbox
          className="mt-1"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <label className="block h-full" onClick={(e) => e.stopPropagation()}>
          <SelectionCheckbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
            className="mt-0"
          />
        </label>
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...columnsToUse];
  }, [columns, hasBatchActions, rowActions]);

  const saveIdsToSessionStorage = React.useCallback(
    (ids: string[]) => {
      if (!ids.length || !id) return;
      sessionStorage.setItem(id, JSON.stringify(ids));
    },
    [id]
  );

  const table = useReactTable({
    data,
    columns: updatedColumns,
    onSortingChange: setLocalSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginator ? getPaginationRowModel() : undefined,
    onPaginationChange: paginator
      ? (valueOrUpdater) => {
          let val = valueOrUpdater;
          if (typeof valueOrUpdater === "function") {
            val = valueOrUpdater(paginator.pagination);
          }
          paginator.setPagination?.(val);
        }
      : undefined,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row._id,
    globalFilterFn: "fuzzy",
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting: localSorting,
      columnVisibility,
      columnOrder: !activeColumnIds
        ? undefined
        : ["select", ...activeColumnIds],
      rowSelection,
      globalFilter,
      ...(paginator ? { pagination: paginator.pagination } : {}),
    },
  });

  // Auto animate batch actions
  const parent = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  // Calculate maximum depth for padding
  const maxDepth = React.useMemo(() => {
    if (!groupBy) return 0;
    const tableSorting = localSorting;
    if (!tableSorting?.length) return 0;
    return tableSorting.map((s) => s.id).filter((id) => groupBy[id]).length;
  }, [groupBy, localSorting]);

  // Helper to render individual table cells with proper padding
  const renderTableCells = React.useCallback(
    (row: Row<T>, paddingDepth: number = maxDepth - 1) => {
      return row.getVisibleCells().map((cell, cellIndex) => {
        const isFirstContentColumn = hasBatchActions
          ? cellIndex === 1
          : cellIndex === 0;

        return (
          <TableCellWithPadding
            key={cell.id}
            paddingDepth={paddingDepth}
            isFirstContentColumn={isFirstContentColumn}
            className={cn(
              cell.column.columnDef.meta?.align == "right" && "text-right"
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCellWithPadding>
        );
      });
    },
    [maxDepth, hasBatchActions]
  );

  // Simplified grouping logic
  const groupRows = React.useCallback(
    (
      rows: Row<T>[],
      groupKeys: string[],
      depth = 0,
      keyPrefix = ""
    ): React.ReactNode[] => {
      if (!groupBy || !groupKeys.length) {
        return rows.map((row) => {
          const rowContent = (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              data-deleted={(row.original as any)?.isDeleted ? "true" : "false"}
              onClick={() => {
                saveIdsToSessionStorage(
                  table.getRowModel().rows.map((r) => r.original._id)
                );
                onRowClick?.(row.original);
              }}
              className="cursor-pointer"
            >
              {renderTableCells(row)}
            </TableRow>
          );

          // Wrap with context menu if row actions are configured
          if (rowActions) {
            return (
              <RowActionsContextMenu
                key={row.id}
                row={row.original}
                config={rowActions}
              >
                {rowContent}
              </RowActionsContextMenu>
            );
          }

          return rowContent;
        });
      }

      const [currentKey, ...remainingKeys] = groupKeys;
      const groupConfig = groupBy[currentKey];

      if (!groupConfig) {
        return groupRows(rows, remainingKeys, depth, keyPrefix);
      }

      // Group rows by the grouper function
      const groups = new Map<string, Row<T>[]>();
      rows.forEach((row) => {
        const groupVal = groupConfig.grouper(row.original);
        if (!groups.has(groupVal)) groups.set(groupVal, []);
        groups.get(groupVal)?.push(row);
      });

      const result: React.ReactNode[] = [];

      Array.from(groups.entries()).forEach(([groupVal, groupRowsArr], i) => {
        console.log(`Processing group: ${groupVal}`, groupRowsArr);
        if (groupRowsArr.length === 0) return;

        const baseKey = `${keyPrefix}-${currentKey}-${groupVal}-${i}`;

        // Render "above" group row
        if (groupConfig.above) {
          result.push(
            <GroupRow
              key={`above-${baseKey}`}
              groupRows={groupRowsArr}
              groupContent={groupConfig.above(
                groupRowsArr.map((r) => r.original),
                depth
              )}
              rowSelection={rowSelection as Record<string, boolean>}
              setRowSelection={setRowSelection}
              hasBatchActions={hasBatchActions}
              columnsLength={updatedColumns.length}
              keyPrefix={`above-${baseKey}`}
              spanAvailable={groupConfig.spanAvailable}
            />
          );
        }

        // Recursively render child rows/groups
        result.push(
          ...groupRows(groupRowsArr, remainingKeys, depth + 1, baseKey)
        );

        // Render "below" group row
        if (groupConfig.below) {
          result.push(
            <GroupRow
              key={`below-${baseKey}`}
              groupRows={groupRowsArr}
              groupContent={groupConfig.below(
                groupRowsArr.map((r) => r.original),
                depth
              )}
              rowSelection={rowSelection as Record<string, boolean>}
              setRowSelection={setRowSelection}
              hasBatchActions={hasBatchActions}
              columnsLength={updatedColumns.length}
              keyPrefix={`below-${baseKey}`}
              spanAvailable={groupConfig.spanAvailable}
            />
          );
        }
      });

      return result;
    },
    [
      groupBy,
      renderTableCells,
      saveIdsToSessionStorage,
      table,
      onRowClick,
      rowSelection,
      setRowSelection,
      hasBatchActions,
      updatedColumns.length,
      rowActions,
    ]
  );

  // Determine if we should show grouped rows
  const shouldShowGroups = React.useMemo(() => {
    const tableSorting = localSorting;
    const validGroupKeys =
      tableSorting?.map((s) => s.id).filter((id) => groupBy?.[id]) || [];
    return groupBy && tableSorting?.length && validGroupKeys.length > 0;
  }, [groupBy, localSorting]);

  const validGroupKeys = React.useMemo(() => {
    const tableSorting = localSorting;
    return tableSorting?.map((s) => s.id).filter((id) => groupBy?.[id]) || [];
  }, [groupBy, localSorting]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 pb-4">
        {!hideSearch && (
          <Input
            placeholder="Search..."
            type="search"
            value={globalFilter}
            onChange={(event) =>
              table.setGlobalFilter(String(event.target.value))
            }
            className="max-w-56"
          />
        )}
        {children}
      </div>

      <ScrollArea className={cn("border rounded-md", className)}>
        <ScrollBar orientation="horizontal" />
        <Table id={id}>
          <TableHeaderComponent headerGroups={table.getHeaderGroups()} />
          <TableBody>
            <BatchActionsRow
              selectedRows={table.getSelectedRowModel().rows}
              totalRows={table.getRowModel().rows}
              batchActions={batchActions}
              onResetSelection={() => table.resetRowSelection()}
              columnsLength={updatedColumns.length}
              parent={parent}
            />

            {table.getRowModel().rows?.length ? (
              shouldShowGroups ? (
                <React.Fragment key={`grouped-${validGroupKeys.join("-")}`}>
                  {groupRows(table.getRowModel().rows, validGroupKeys)}
                </React.Fragment>
              ) : (
                <React.Fragment key="ungrouped">
                  <BodyRows
                    rows={table.getRowModel().rows}
                    rowActions={rowActions}
                    onRowClick={(row) => {
                      saveIdsToSessionStorage(
                        table
                          .getFilteredRowModel()
                          .rows.map((r) => r.original._id)
                      );
                      onRowClick?.(row);
                    }}
                  />
                </React.Fragment>
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={updatedColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {paginator && (
        <Pagination className="gap-2 pt-2">
          <PaginationContent className="gap-2 ">
            <PaginationItem>
              <PaginationFirst
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="flex items-center gap-1 px-2 text-sm pointer-events-none select-none">
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount().toLocaleString()}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Per Page" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 30, 50, 1000].map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      Per page {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

// Additional reusable components
type TableHeaderComponentProps = {
  headerGroups: any[];
};

const TableHeaderComponent = React.memo<TableHeaderComponentProps>(
  ({ headerGroups }) => (
    <TableHeader>
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header: any) => {
            if (header.isPlaceholder) {
              return (
                <TableHead
                  key={header.id}
                  style={{ width: `${header.getSize()}px` }}
                />
              );
            }

            if (header.column?.columnDef.enableSorting === false) {
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.column.columnDef.meta?.align === "right" &&
                      "text-right"
                  )}
                  style={{ width: `${header.getSize()}px` }}
                >
                  <div className="py-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                </TableHead>
              );
            }

            return (
              <TableHead
                key={header.id}
                style={{ width: `${header.getSize()}px` }}
              >
                <Button
                  variant="link"
                  className={cn(
                    "w-full flex items-center gap-2 py-2 px-0 justify-start focus-visible:ring-0",
                    {
                      "flex-row-reverse":
                        header.column?.columnDef.meta?.align === "right",
                    },
                    header.column?.columnDef.meta?.align === "right" &&
                      "text-right"
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() && (
                    <ArrowDown
                      className={cn("w-4 h-4 transition-all duration-100", {
                        "rotate-180": header.column.getIsSorted() === "desc",
                      })}
                    />
                  )}
                </Button>
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  )
);
TableHeaderComponent.displayName = "TableHeaderComponent";

type BatchActionsRowProps<T extends { _id: string }> = {
  selectedRows: Row<T>[];
  totalRows: Row<T>[];
  batchActions?: BatchAction<T>[];
  onResetSelection: () => void;
  columnsLength: number;
  parent: React.RefObject<HTMLDivElement | null>;
};

const BatchActionsRow = React.memo<BatchActionsRowProps<any>>(
  ({
    selectedRows,
    totalRows,
    batchActions,
    onResetSelection,
    columnsLength,
    parent,
  }) => (
    <tr className={cn({ hidden: !totalRows?.length })}>
      <td
        colSpan={columnsLength}
        className="sticky top-[theme(spacing.10)] z-10 p-0"
      >
        <div ref={parent}>
          {selectedRows.length > 0 && (
            <div className="flex items-center w-full gap-2 p-2 border-t border-b bg-background">
              {batchActions?.map((action, i) => (
                <Button
                  key={i}
                  {...action.buttonProps}
                  onClick={() =>
                    action.onClick(
                      selectedRows.map((row) => row.original),
                      onResetSelection
                    )
                  }
                />
              ))}
              <Button onClick={onResetSelection} variant="outline">
                Unselect all
              </Button>
              <Spacer />
              <div className="text-sm">
                {selectedRows.length} of {totalRows.length} row(s) selected.
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
);
BatchActionsRow.displayName = "BatchActionsRow";

type BodyRowsProps<T extends { _id: string }> = {
  rows: Row<T>[];
  onRowClick?: (row: T) => void;
  rowActions?: RowActionsConfig<T>;
};

function BodyRows<T extends { _id: string }>({
  rows,
  onRowClick,
  rowActions,
}: BodyRowsProps<T>) {
  return (
    <>
      {rows.map((row) => {
        const rowContent = (
          <TableRow
            key={row.id}
            data-deleted={(row.original as any)?.isDeleted ? "true" : "false"}
            data-state={row.getIsSelected() && "selected"}
            onClick={() => onRowClick?.(row.original)}
            className="cursor-pointer"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCellWithPadding key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCellWithPadding>
            ))}
          </TableRow>
        );

        // Wrap with context menu if row actions are configured
        if (rowActions) {
          return (
            <RowActionsContextMenu
              key={row.id}
              row={row.original}
              config={rowActions}
            >
              {rowContent}
            </RowActionsContextMenu>
          );
        }

        return rowContent;
      })}
    </>
  );
}
