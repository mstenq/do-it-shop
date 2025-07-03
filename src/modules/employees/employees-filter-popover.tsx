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
import { api } from "@convex/api";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { FilterIcon } from "lucide-react";
import { useMemo } from "react";

export function EmployeesFilterPopover() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  // Get employees data to extract unique departments, levels, and grades
  const employees = useQuery(api.employees.all, { includeDeleted: true });

  const filters = (search as any)?.filters || {
    department: "",
    level: "",
    grade: "",
    showDeleted: false,
  };

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    if (!employees) return { departments: [], levels: [], grades: [] };

    const departments = [
      ...new Set(
        employees.map((emp) => emp.department).filter(Boolean) as string[]
      ),
    ].sort();
    const levels = [
      ...new Set(employees.map((emp) => emp.level).filter(Boolean) as string[]),
    ].sort();
    const grades = [
      ...new Set(employees.map((emp) => emp.grade).filter(Boolean) as string[]),
    ].sort();

    return { departments, levels, grades };
  }, [employees]);

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
          department: "",
          level: "",
          grade: "",
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
            <Label htmlFor="department">Department</Label>
            <Select
              value={filters.department}
              onValueChange={(value) => updateFilter("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {filterOptions.departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={filters.level}
              onValueChange={(value) => updateFilter("level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {filterOptions.levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={filters.grade}
              onValueChange={(value) => updateFilter("grade", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {filterOptions.grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
