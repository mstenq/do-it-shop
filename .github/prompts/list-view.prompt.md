---
mode: agent
tools: ['changes', 'codebase', 'editFiles', 'problems', 'runCommands', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'convex-mcp']
---
# List View Generator Prompt

## Purpose
Generate a complete list view module for a given data model, including layout route, index route with data table, and all supporting components following the InEvent project patterns.

## Prerequisites
Before using this prompt, ensure:
1. The Convex schema for the target table exists in `convex/schema.ts`
2. Basic CRUD operations exist in the corresponding Convex file (e.g., `convex/tableName.ts`)
3. The module name and table name are determined

## Required Information

### Module Configuration
- **Module Name**: (e.g., "vendors", "employees", "events")
- **Table Name**: (Convex table name, usually same as module name)
- **Display Name**: (Human-readable name for UI, e.g., "Vendors", "Employees")
- **Description**: (Brief description for forms and headers)

### Field Configuration
Please specify which fields from the schema should be:
- **Displayed in table columns**: List the field names that should appear as table columns
- **Filterable**: Which fields should have filter controls in the UI
- **Sortable**: Which fields should support sorting (usually all displayed fields)
- **Searchable**: Which fields should be included in global search

### Navigation
- **Parent route**: If this is a nested route, specify the parent (e.g., "/dashboard")
- **Breadcrumb title**: Title to show in breadcrumbs

## Generated Files Structure

The prompt will generate the following files:

```
src/
  routes/
    {module-name}.tsx                   # Layout route with header, navigation, modals
    {module-name}.index.tsx             # List view with data table
  modules/
    {module-name}/
      index.ts                          # Public API exports
      types.ts                          # Type definitions
      use-{module-name}-data.ts         # Data fetching hook
      use-{module-name}-columns.tsx     # Table columns configuration
      new-{module-name}.tsx             # Create modal component
      edit-{module-name}.tsx            # Edit modal component
      {module-name}-form.tsx            # Shared form component
      {module-name}-filter-popover.tsx  # Filter popover component
```

### Required Module Exports

The `index.ts` file must export all components and hooks:
```tsx
// Public API exports
export { useModuleData } from "./use-module-data";
export { useModuleColumns, ModuleColumn, ModuleSortingSchema } from "./use-module-columns";
export { NewModule } from "./new-module";
export { EditModule } from "./edit-module";
export { ModuleForm } from "./module-form";
export { ModuleFilterPopover } from "./module-filter-popover";
```

## Implementation Guidelines

### 1. Layout Route (`/module-name.tsx`)
- Import and use `AppHeader` with `RecordNavigation`
- Include "New" button that opens the create modal
- Use search params for modal state management (`showAdd`, `showEdit`)
- Include `<Outlet />` for nested routes
- Include `<NewModule />` and `<EditModule />` components

### 2. Index Route (`/module-name.index.tsx`)

#### Required Imports
```tsx
import { ColumnsManager } from "@/components/columns-manager";
import { CurrentFilters } from "@/components/current-filters";
import { DataTable } from "@/components/data-table";
import { Spacer } from "@/components/spacer";
import { useStandardBatchActions } from "@/hooks/use-standard-batch-actions";
```

#### Search Schema Implementation
- Define `defaultSearch` object with:
  - `q`: Global search query (empty string)
  - `columns`: Default visible columns array from enum
  - `sorting`: Default column sorting (usually by ID ascending)
  - `pagination`: pageIndex (0) and pageSize (30)
  - `filters`: Object with all filterable fields and their defaults
- Create `indexSearchSchema` using Zod with proper defaults and coercion
- Use `stripSearchParams` middleware to clean URL parameters
- Implement `beforeLoad` with `restoreSearchStateByPath` for state persistence
- Implement `onLeave` with `saveSearchStateByPath` for state persistence

#### Component Structure
```tsx
function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const data = useModuleData({ includeDeleted: search.filters.showDeleted });
  const destroy = useMutation(api.moduleName.destroy);
  const restore = useMutation(api.moduleName.restore);
  const { columns, groupBy, rowActions } = useModuleColumns();
  const batchActions = useStandardBatchActions({
    destroy,
    restore,
    showDeleted: search.filters.showDeleted,
  });

  return (
    <div className="p-4">
      <DataTable
        id="/module-name/$id"
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
        onRowClick={(row) => navigate({ 
          to: "/module-name/$id", 
          params: { id: row.id },
          search: { showEdit: "", showAdd: false }
        })}
        batchActions={batchActions}
        paginator={{
          pagination: search.pagination,
          setPagination: (pagination) => navigate({ search: (o) => ({ ...o, pagination }) }),
        }}
      >
        <CurrentFilters filters={search.filters} />
        <Spacer />
        <ColumnsManager
          columns={columns}
          activeColumnIds={search.columns}
          onChangeColumns={(columns) => navigate({ search: { ...search, columns } })}
        />
        <ModuleFilterPopover />
      </DataTable>
    </div>
  );
}
```

#### Required DataTable Children Components
1. **CurrentFilters**: Shows active filters with clear options
2. **Spacer**: Provides spacing between filter components  
3. **ColumnsManager**: Column visibility and ordering controls
4. **ModuleFilterPopover**: Custom filter controls specific to the module

#### DataTable Props Configuration
- `id`: Route pattern for row navigation (e.g., "/module-name/$id")
- `data`: Filtered data from the data hook
- `columns`: Column definitions from columns hook
- `activeColumnIds`: Currently visible columns from search state
- `sorting`: Current sorting state from search params
- `rowActions`: Action menu for individual rows
- `setSorting`: Navigation handler for sorting changes
- `search`: Global search query from search params
- `setSearch`: Navigation handler for search changes
- `className`: Responsive max-height styling
- `groupBy`: Grouping configuration from columns hook
- `onRowClick`: Navigation to detail view
- `batchActions`: Array returned from `useStandardBatchActions` hook
- `paginator`: Pagination state and handlers

#### Batch Actions Implementation
- Use the `useStandardBatchActions` hook for standard delete and restore operations
- The hook handles all AlertDialog logic, toast notifications, and error handling
- Pass `destroy` and `restore` mutations from Convex along with `showDeleted` state
- The hook returns an array of batch action objects ready for DataTable consumption

#### useStandardBatchActions Hook Usage
```tsx
const batchActions = useStandardBatchActions({
  destroy,        // Convex mutation for batch delete
  restore,        // Convex mutation for batch restore
  showDeleted: search.filters.showDeleted,  // Boolean to show/hide restore action
});
```

The hook automatically provides:
- **Delete action**: Always available for non-deleted records with destructive styling
- **Restore action**: Only shown when `showDeleted` is true, with outline styling
- **Confirmation dialogs**: AlertDialog for both delete and restore operations
- **Toast notifications**: Success messages after operations complete
- **Error handling**: Try/catch blocks with console logging
- **Row unselection**: Automatic cleanup after operations complete

### 3. Data Hook (`use-module-data.ts`)

#### Required Structure
```tsx
import { ConvexType } from "@/utils/convexType";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@convex/api";
import { Route } from "@/routes/module-name.index";
import { useMemo } from "react";

interface UseModuleDataOptions {
  includeDeleted?: boolean;
}

export function useModuleData(options: UseModuleDataOptions = {}) {
  const { includeDeleted = false } = options;
  const search = Route.useSearch();
  
  const data = useQuery(
    api.moduleName.all,
    { includeDeleted }
  );

  const filteredData = useMemo(() => {
    if (!data) return data;
    
    let filtered = data;

    // Apply global search filter
    if (search.q) {
      const query = search.q.toLowerCase();
      filtered = filtered.filter((item) => {
        // Include searchable fields
        return (
          item.name?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          item.id?.toString().includes(query)
          // Add more searchable fields as needed
        );
      });
    }

    // Apply specific filters
    if (search.filters.fieldName && search.filters.fieldName !== "") {
      filtered = filtered.filter((item) => item.fieldName === search.filters.fieldName);
    }

    // Apply soft delete filter
    if (!search.filters.showDeleted) {
      filtered = filtered.filter((item) => !item.deletedAt);
    }

    return filtered;
  }, [data, search.q, search.filters]);

  return filteredData;
}
```

#### Implementation Guidelines
- Use `useQuery` from `convex-helpers/react/cache` for caching
- Accept options parameter for configuration like `includeDeleted`
- Implement client-side filtering with useMemo for performance
- Filter by global search query across searchable fields
- Apply all filter criteria from search params
- Handle soft delete filtering based on `showDeleted` flag
- Return properly typed filtered data array

### 4. Columns Hook (`use-module-columns.tsx`)

#### Required Structure
```tsx
import { ConvexType } from "@/utils/convexType";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, RotateCcw } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Route } from "@/routes/module-name.index";
import { z } from "zod";

// Define column enum for visibility management
export const ModuleColumn = z.enum([
  "id", 
  "name", 
  // Add all other column identifiers
]);

// Define sorting schema
export const ModuleSortingSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export function useModuleColumns() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const columns: ColumnDef<ConvexType<"moduleName.all">[number]>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.id}</div>
      ),
      size: 80,
      enableSorting: true,
    },
    // Add more column definitions based on schema
  ];

  const rowActions: ColumnDef<ConvexType<"moduleName.all">[number]> = {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original;
      const isDeleted = record.deletedAt != null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isDeleted && (
              <>
                <DropdownMenuItem
                  onClick={() => navigate({
                    search: { ...search, showEdit: record._id }
                  })}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {isDeleted && (
              <DropdownMenuItem>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 60,
    enableSorting: false,
  };

  const groupBy = {
    // Define grouping options if applicable
    // Example: status: { label: "Status", accessor: "status" }
  };

  return { columns, rowActions, groupBy };
}
```

#### Column Implementation Guidelines
- Define column enum with all possible column identifiers
- Include ID column with monospace font styling
- Implement proper cell renderers for different data types
- Add row actions dropdown with edit/delete/restore options
- Handle soft delete states in row actions
- Configure appropriate column sizes
- Enable sorting where appropriate
- Use proper TypeScript typing with ConvexType

### 5. Form Component (`module-form.tsx`)
- Use Zod schema for validation
- Implement proper form field sections with semantic grouping
- Use consistent styling with `formItemClassName`
- Handle optional fields and transformations
- Include proper form labels and help text

### 6. Create Modal (`new-module.tsx`)
- Use Sheet component for modal
- Implement proper form submission with error handling
- Navigate to detail view after successful creation
- Reset form on successful submission
- Handle loading states

### 7. Edit Modal (`edit-module.tsx`)
- Load existing data and populate form
- Handle loading spinner while data loads
- Implement update mutation
- Close modal after successful update
- Handle form reset with existing data

### 8. Filter Popover (`module-filter-popover.tsx`)

#### Required Structure
```tsx
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Route } from "@/routes/module-name.index";

export function ModuleFilterPopover() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  
  const activeFiltersCount = Object.values(search.filters).filter(
    (value) => value !== "" && value !== false
  ).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ search: { ...search, filters: {} } })}
            >
              Clear all
            </Button>
          </div>
          
          {/* Implement filter controls based on field types */}
          {/* Example: Select dropdown for enum fields */}
          <div className="space-y-2">
            <Label>Field Name</Label>
            <Select
              value={search.filters.fieldName || ""}
              onValueChange={(value) =>
                navigate({
                  search: {
                    ...search,
                    filters: { ...search.filters, fieldName: value },
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All options</SelectItem>
                {/* Add dynamic options */}
              </SelectContent>
            </Select>
          </div>

          {/* Example: Checkbox for boolean fields */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showDeleted"
              checked={search.filters.showDeleted}
              onCheckedChange={(checked) =>
                navigate({
                  search: {
                    ...search,
                    filters: { ...search.filters, showDeleted: checked },
                  },
                })
              }
            />
            <Label htmlFor="showDeleted">Show deleted records</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

#### Filter Implementation Guidelines
- Use Popover component for the filter interface
- Show active filter count as a badge on the trigger button
- Include "Clear all" button to reset filters
- Implement appropriate controls for each field type:
  - **Select/Multi-select** for enum and relationship fields
  - **Checkbox** for boolean fields
  - **Date range picker** for date fields
  - **Number range** for numeric fields
- Update search params through navigation
- Always include `showDeleted` filter for soft delete support

## Schema Analysis Requirements

Before generating code, analyze the Convex schema to understand:
1. **Field types**: String, number, boolean, optional fields, arrays
2. **Relationships**: Foreign keys to other tables (Id<"tableName">)
3. **Required fields**: Fields without optional modifier
4. **Validation rules**: Min/max lengths, formats, enums

## Filter Types by Field Type

### String Fields
- Text input for exact/partial match
- Select dropdown for enum values
- Multi-select for array fields

### Number Fields
- Range slider or min/max inputs
- Exact value input

### Boolean Fields
- Checkbox or toggle
- Three-state: true/false/all

### Date Fields
- Date range picker
- Relative date options (last week, month, etc.)

### Relationship Fields
- Select dropdown with options from related table
- Multi-select for many-to-many relationships

## Code Quality Standards

### TypeScript
- Use strict typing throughout
- Export types from `types.ts`
- Use Zod for runtime validation
- Implement proper error handling

### Styling
- Use Tailwind CSS classes
- Follow shadcn/ui component patterns
- Maintain consistent spacing and typography
- Implement responsive design

### Performance
- Use proper memoization where needed
- Implement efficient filtering and sorting
- Use virtual scrolling for large datasets
- Optimize Convex queries

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Provide screen reader support
- Use semantic HTML elements

## Implementation Example

### Complete Example Request
```markdown
## Request
Please generate a complete list view for the "employees" module.

**Module Configuration:**
- Module Name: employees
- Table Name: employees  
- Display Name: Employees
- Description: Manage event staff and employees

**Fields to Display:**
- id (ID column)
- name (with email as subtitle)
- role
- department
- status
- startDate

**Filterable Fields:**
- role (select dropdown from enum)
- department (select dropdown from enum)  
- status (select dropdown: active/inactive)
- showDeleted (checkbox for soft delete)

**Additional Requirements:**
- Include soft delete support with restore functionality
- Group by department option in columns hook
- Global search across name, email, and ID fields
- Default sorting by ID ascending
- Pagination with 30 items per page
- Navigation to employee detail view on row click
```



