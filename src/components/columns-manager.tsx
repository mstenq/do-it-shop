import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  camelToProperCase,
  stringToSpacedTitleCase,
} from "@/utils/textCaseConvert";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, EyeIcon, EyeOff } from "lucide-react";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ColumnItemProps<T, TColumnId extends string = string> {
  column: ColumnDef<T>;
  isVisible: boolean;
  isReorderMode: boolean;
  onToggleVisibility: (id: TColumnId) => void;
}

function getColumnHeaderText<T>(column: ColumnDef<T>): string {
  if (typeof column.header === "string") {
    return column.header;
  }

  // Fallback to column id or empty string
  return stringToSpacedTitleCase(column.id!);
}

function ColumnItem<T, TColumnId extends string = string>({
  column,
  isVisible,
  isReorderMode,
  onToggleVisibility,
}: ColumnItemProps<T, TColumnId>) {
  const id = column.id;
  if (!id) {
    throw new Error("Column id is required");
  }
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isReorderMode && !isVisible) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      //@ts-ignore
      role={isReorderMode ? "button" : "checkbox"}
      aria-checked={!isReorderMode ? isVisible : undefined}
      //@ts-ignore
      tabIndex={0}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg select-none",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "bg-accent",
        isReorderMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      )}
      onClick={
        isReorderMode ? undefined : () => onToggleVisibility(id as TColumnId)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isReorderMode) {
            onToggleVisibility(id as TColumnId);
          }
        }
      }}
      {...(isReorderMode ? { ...attributes, ...listeners } : {})}
    >
      <div className="flex items-center justify-center w-4 h-4">
        {isReorderMode ? (
          <DragHandleDots2Icon className="w-4 h-4" />
        ) : isVisible ? (
          <Eye className="w-3 h-3" />
        ) : (
          <EyeOff className="w-3 h-3" />
        )}
      </div>
      <span
        className={cn("text-sm", {
          "text-muted-foreground opacity-70": !isReorderMode && !isVisible,
        })}
      >
        {getColumnHeaderText(column)}
      </span>
    </div>
  );
}

interface ColumnsManagerProps<T, TColumnId extends string = string> {
  columns: ColumnDef<T>[];
  activeColumnIds: TColumnId[];
  onChangeColumns: (columnIds: TColumnId[]) => void;
}

export function ColumnsManager<T, TColumnId extends string = string>({
  columns,
  activeColumnIds,
  onChangeColumns,
}: ColumnsManagerProps<T, TColumnId>) {
  const [parent] = useAutoAnimate();

  const [isReorderMode, setIsReorderMode] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Sort columns based on activeColumnIds order for the visibility mode
  const sortedColumns = React.useMemo(() => {
    const filtered = [...columns].filter(
      (column) => !column.meta?.alwaysVisible
    );
    const sorted = [...filtered].sort((a, b) => {
      if (!a.id || !b.id) {
        throw new Error("Column id is required");
      }
      const aIndex = activeColumnIds.indexOf(a.id as TColumnId);
      const bIndex = activeColumnIds.indexOf(b.id as TColumnId);
      // Put non-active columns at the end
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    return sorted;
  }, [columns, activeColumnIds]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeColumnIds.indexOf(active.id as TColumnId);
      const newIndex = activeColumnIds.indexOf(over.id as TColumnId);
      onChangeColumns(arrayMove(activeColumnIds, oldIndex, newIndex));
    }
  };

  const toggleColumnVisibility = (columnId: TColumnId) => {
    if (activeColumnIds.includes(columnId)) {
      onChangeColumns(activeColumnIds.filter((id) => id !== columnId));
    } else {
      onChangeColumns([...activeColumnIds, columnId]);
    }
  };

  const visibleColumns = columns.filter((column) =>
    activeColumnIds.includes(column.id! as TColumnId)
  );
  const canReorderColumns = visibleColumns.length >= 2;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <EyeIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent side="bottom">
          <p>Column Manager</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-[300px] p-2" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="pl-3 text-sm font-medium">
              {isReorderMode ? "Reorder columns" : "Show/hide columns"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsReorderMode(!isReorderMode)}
              disabled={!canReorderColumns}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {isReorderMode ? "Done" : "Reorder"}
            </Button>
          </div>
          {isReorderMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeColumnIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {sortedColumns.map((column) => {
                    return (
                      <ColumnItem
                        key={column.id}
                        column={column}
                        isVisible={activeColumnIds.includes(
                          column.id! as TColumnId
                        )}
                        isReorderMode={isReorderMode}
                        onToggleVisibility={toggleColumnVisibility}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div ref={parent} className="space-y-1">
              {sortedColumns.map((column, i) => {
                const isVisible = activeColumnIds.includes(
                  column.id! as TColumnId
                );
                const isFirstHiddenColumn =
                  !isVisible &&
                  !sortedColumns
                    .slice(0, i)
                    .some(
                      (col) => !activeColumnIds.includes(col.id! as TColumnId)
                    );
                return (
                  <React.Fragment key={column.id}>
                    {isFirstHiddenColumn && (
                      <div className="pt-2 pl-2 text-xs text-muted-foreground">
                        Hidden Columns
                      </div>
                    )}
                    <ColumnItem
                      key={column.id}
                      column={column}
                      isVisible={activeColumnIds.includes(
                        column.id! as TColumnId
                      )}
                      isReorderMode={isReorderMode}
                      onToggleVisibility={toggleColumnVisibility}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
