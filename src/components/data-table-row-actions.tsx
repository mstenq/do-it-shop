import * as React from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

// Action types
export type RowActionItem<T = any> =
  | RowActionButton<T>
  | RowActionCheckbox<T>
  | RowActionRadioGroup<T>
  | RowActionSeparator
  | RowActionLabel
  | RowActionSubmenu<T>;

export interface RowActionButton<T = any> {
  type: "button";
  label: string;
  onClick: (row: T, event?: React.MouseEvent) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

export interface RowActionCheckbox<T = any> {
  type: "checkbox";
  label: string;
  checked: (row: T) => boolean;
  onCheckedChange: (row: T, checked: boolean) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface RowActionRadioGroup<T = any> {
  type: "radio-group";
  value: (row: T) => string;
  onValueChange: (row: T, value: string) => void;
  items: Array<{
    value: string;
    label: string;
    disabled?: (row: T) => boolean;
  }>;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface RowActionSeparator {
  type: "separator";
}

export interface RowActionLabel {
  type: "label";
  label: string;
}

export interface RowActionSubmenu<T = any> {
  type: "submenu";
  label: string;
  items: RowActionItem<T>[];
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface RowActionsConfig<T = any> {
  items: RowActionItem<T>[];
  showDropdownButton?: boolean;
  dropdownButtonProps?: Partial<React.ComponentProps<typeof Button>>;
}

// Helper function to filter visible items
function getVisibleItems<T>(
  items: RowActionItem<T>[],
  row: T
): RowActionItem<T>[] {
  return items.filter((item) => {
    if ("hidden" in item && typeof item.hidden === "function") {
      return !item.hidden(row);
    }
    return true;
  });
}

// Render functions for dropdown menu
function renderDropdownMenuItem<T>(
  item: RowActionItem<T>,
  row: T,
  key: string
): React.ReactNode {
  switch (item.type) {
    case "button":
      return (
        <DropdownMenuItem
          key={key}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick(row, e);
          }}
          disabled={item.disabled?.(row)}
          className={
            item.variant === "destructive"
              ? "text-destructive focus:text-destructive"
              : ""
          }
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </DropdownMenuItem>
      );

    case "checkbox":
      return (
        <DropdownMenuCheckboxItem
          key={key}
          checked={item.checked(row)}
          onCheckedChange={(checked) => item.onCheckedChange(row, checked)}
          disabled={item.disabled?.(row)}
          onSelect={(e) => e.preventDefault()}
        >
          {item.label}
        </DropdownMenuCheckboxItem>
      );

    case "radio-group":
      return (
        <DropdownMenuRadioGroup
          key={key}
          value={item.value(row)}
          onValueChange={(value) => item.onValueChange(row, value)}
        >
          {item.items.map((radioItem, index) => (
            <DropdownMenuRadioItem
              key={`${key}-${index}`}
              value={radioItem.value}
              disabled={radioItem.disabled?.(row) || item.disabled?.(row)}
            >
              {radioItem.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      );

    case "separator":
      return <DropdownMenuSeparator key={key} />;

    case "label":
      return <DropdownMenuLabel key={key}>{item.label}</DropdownMenuLabel>;

    case "submenu":
      const visibleSubItems = getVisibleItems(item.items, row);
      if (visibleSubItems.length === 0) return null;

      return (
        <DropdownMenuSub key={key}>
          <DropdownMenuSubTrigger disabled={item.disabled?.(row)}>
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {visibleSubItems.map((subItem, index) =>
              renderDropdownMenuItem(subItem, row, `${key}-sub-${index}`)
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );

    default:
      return null;
  }
}

// Render functions for context menu
function renderContextMenuItem<T>(
  item: RowActionItem<T>,
  row: T,
  key: string
): React.ReactNode {
  switch (item.type) {
    case "button":
      return (
        <button
          type="button"
          key={key}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick(row, e);
          }}
          disabled={item.disabled?.(row)}
          className={cn(
            "w-full relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            item.variant === "destructive" &&
              "text-destructive focus:text-destructive"
          )}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </button>
      );

    case "checkbox":
      return (
        <ContextMenuCheckboxItem
          key={key}
          checked={item.checked(row)}
          onCheckedChange={(checked) => item.onCheckedChange(row, checked)}
          disabled={item.disabled?.(row)}
          onSelect={(e) => e.preventDefault()}
        >
          {item.label}
        </ContextMenuCheckboxItem>
      );

    case "radio-group":
      return (
        <ContextMenuRadioGroup
          key={key}
          value={item.value(row)}
          onValueChange={(value) => item.onValueChange(row, value)}
        >
          {item.items.map((radioItem, index) => (
            <ContextMenuRadioItem
              key={`${key}-${index}`}
              value={radioItem.value}
              disabled={radioItem.disabled?.(row) || item.disabled?.(row)}
            >
              {radioItem.label}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
      );

    case "separator":
      return <ContextMenuSeparator key={key} />;

    case "label":
      return <ContextMenuLabel key={key}>{item.label}</ContextMenuLabel>;

    case "submenu":
      const visibleSubItems = getVisibleItems(item.items, row);
      if (visibleSubItems.length === 0) return null;

      return (
        <ContextMenuSub key={key}>
          <ContextMenuSubTrigger disabled={item.disabled?.(row)}>
            {item.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {visibleSubItems.map((subItem, index) =>
              renderContextMenuItem(subItem, row, `${key}-sub-${index}`)
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );

    default:
      return null;
  }
}

// Main dropdown menu component
interface RowActionsDropdownProps<T> {
  row: T;
  config: RowActionsConfig<T>;
  className?: string;
}

export function RowActionsDropdown<T>({
  row,
  config,
  className,
}: RowActionsDropdownProps<T>) {
  const visibleItems = getVisibleItems(config.items, row);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" {...config.dropdownButtonProps}>
            <EllipsisVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibleItems.map((item, index) =>
            renderDropdownMenuItem(item, row, `dropdown-${index}`)
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Context menu wrapper component
interface RowActionsContextMenuProps<T> {
  row: T;
  config: RowActionsConfig<T>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function RowActionsContextMenu<T>({
  row,
  config,
  children,
  disabled = false,
}: RowActionsContextMenuProps<T>) {
  const visibleItems = getVisibleItems(config.items, row);

  if (visibleItems.length === 0 || disabled) {
    return <>{children}</>;
  }

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {visibleItems.map((item, index) =>
          renderContextMenuItem(item, row, `context-${index}`)
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
