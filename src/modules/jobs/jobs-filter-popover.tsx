import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FilterIcon } from "lucide-react";

export function JobsFilterPopover() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const filters = (search as any)?.filters || {
    showDeleted: false,
  };

  const updateFilter = (key: string, value: any) => {
    navigate({
      search: {
        ...search,
        filters: {
          ...filters,
          [key]: value,
        },
      } as any,
    });
  };

  const clearFilters = () => {
    navigate({
      search: {
        ...search,
        filters: {
          showDeleted: false,
        },
      } as any,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== false
  ).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <FilterIcon className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute flex items-center justify-center w-5 h-5 text-xs rounded-full -top-2 -right-2 bg-primary text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="showDeleted">Show Deleted</Label>
            <Select
              value={filters.showDeleted ? "true" : "false"}
              onValueChange={(value) =>
                updateFilter("showDeleted", value === "true")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Hide Deleted</SelectItem>
                <SelectItem value="true">Show Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="pt-4 -mx-4 -mb-4">
          <Separator />
          <div className="flex items-center justify-between p-1">
            <Button
              variant="ghost"
              className="w-full font-normal"
              onClick={clearFilters}
            >
              Clear
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <PopoverClose asChild>
              <Button variant="ghost" className="w-full font-normal">
                Close
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
