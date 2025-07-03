---
mode: agent
tools: ['changes', 'codebase', 'editFiles', 'problems', 'search', 'searchResults', 'convex-mcp']
---

# InEvent Simple Module Generator

An intelligent assistant that creates streamlined, production-ready modules for the InEvent application following the simple module pattern (like transportation-carriers). This tool generates modules that focus on basic CRUD operations with list view, inline editing via drawers/sheets, and minimal filtering.

## What This Tool Does

This assistant creates simplified modules that include:

- **Backend Integration**: Convex database schema, CRUD operations, authentication, and incrementor ID system
- **Frontend Components**: React components with shadcn/ui design system and TypeScript types
- **Routing System**: Simple TanStack Router with layout and index routes only
- **Form Management**: React Hook Form with Zod validation schemas
- **Data Management**: Real-time Convex subscriptions with basic search functionality
- **UI/UX Consistency**: Clean, responsive design following established patterns

The tool examines existing simple modules (like transportation-carriers) to ensure consistency in:
- Simplified file structure without detail pages
- Sheet/drawer-based editing and creation
- Basic search functionality without complex filters
- Streamlined table with batch operations

## Simple Module Pattern

Simple modules are ideal for:
- Reference data (categories, types, carriers, etc.)
- Supporting entities that don't need detailed views
- Quick CRUD operations with minimal complexity
- Data that primarily serves as lookup tables

## Module Specification

Create a streamlined module with backend, frontend components, and basic routes following the simple InEvent patterns.

## Module Information

**Module Name**: {moduleName} (e.g., "waves", "categories", "carriers")
**Table Name**: {tableName} (e.g., "waves", "categories", "carriers")  
**Display Name**: {displayName} (e.g., "Waves", "Categories", "Carriers")
**ID Prefix**: {idPrefix} (3-letter prefix for incrementor IDs, e.g., "WAV", "CAT", "CAR")

## Required Fields

**Core Fields**: Define the main data fields for this entity

- Field name and type (string, number, boolean, date, etc.)
- Whether field is required or optional
- Any validation rules or constraints
- Related entity references (foreign keys)

**Example**:
```typescript
{
  name: v.string(), // required
  description: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
}
```

## Files to Generate

The tool will create the following simplified file structure:

### Backend (Convex)

- `convex/{tableName}.ts` - CRUD operations (all, get, add, update, destroy)
- Update `convex/schema.ts` - Add table schema definition
- Update `convex/incrementors.ts` - Add ID prefix mapping

### Frontend Module

- `src/modules/{moduleName}/index.ts` - Public API exports
- `src/modules/{moduleName}/{moduleName}Const.ts` - Constants and utilities
- `src/modules/{moduleName}/use-{moduleName}-data.ts` - Data fetching hook
- `src/modules/{moduleName}/use-{moduleName}-columns.tsx` - Table columns
- `src/modules/{moduleName}/{moduleName}-form.tsx` - Create/edit form
- `src/modules/{moduleName}/new-{moduleName}.tsx` - Create sheet/drawer
- `src/modules/{moduleName}/edit-{moduleName}.tsx` - Edit sheet/drawer
- `src/modules/{moduleName}/{moduleName}-filter-popover.tsx` - Filter component with TanStack Router integration

### Routes

- `src/routes/{moduleName}.tsx` - Layout route with header and actions
- `src/routes/{moduleName}.index.tsx` - List view with table and search

## Implementation Pattern

### 1. Backend Setup

- Add table schema to Convex with proper indexes
- Create CRUD operations with authentication (all, get, add, update, destroy)
- Add incrementor prefix for friendly IDs
- Include soft delete pattern where appropriate

### 2. Module Structure

- Follow transportation-carriers module pattern
- Include proper TypeScript types throughout
- Implement form validation with Zod schemas
- Add proper error handling and loading states
- Use sheets/drawers for creation and editing

### 3. Route Configuration

- Set up simple file-based routing with TanStack Router
- Layout route with header and "New" button
- Index route with searchable data table
- No complex search state - just basic search box

### 4. UI Components

- Use shadcn/ui components consistently
- Implement responsive design patterns
- Sheet/drawer pattern for create/edit operations
- Add proper loading and error states
- Include accessibility features

### 5. Data Management

- Use Convex for real-time data subscriptions
- Implement optimistic updates where appropriate
- Basic search functionality across relevant fields
- Batch operations (like delete) where appropriate

### 6. Row Actions Implementation

- **Standard Row Actions**: Every module should include Edit, Delete, and Restore actions
- **Contextual Actions**: Actions should be conditionally shown/hidden based on record state
- **Mutation Integration**: Wire up Convex mutations for delete/restore operations
- **Toast Notifications**: Provide user feedback for successful operations
- **Navigation Integration**: Use TanStack Router for edit navigation

## Generated Code Features

- **Type Safety**: Full TypeScript coverage with proper type inference
- **Form Validation**: Zod schemas for client and server validation
- **Real-time Updates**: Convex subscriptions for live data
- **Basic Search**: Simple text search across entity fields
- **Row Actions**: Context menu and dropdown actions for individual records
- **Batch Operations**: Bulk delete/restore functionality with confirmation dialogs
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: Keyboard navigation and screen reader support
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton loading and optimistic updates

## Usage Instructions & Workflow

### Step 1: Analysis Phase

The assistant will analyze your existing simple modules to understand:
- Current simple module patterns and structure
- Existing Convex schemas and relationships
- Sheet/drawer component patterns
- Basic search and table functionality

### Step 2: Information Gathering

You'll be asked to provide:
- **Module Information**: Name, table name, display name, and ID prefix
- **Field Definitions**: Data structure with types and validation
- **Any Special Requirements**: Custom validation, relationships, etc.

### Step 3: Code Generation

The assistant will generate all necessary files:

1. **Backend First**: Convex schema, CRUD operations, and incrementor updates
2. **Module Structure**: TypeScript types, constants, and utility functions
3. **Components**: Forms, sheets, data hooks following simple patterns
4. **Routing**: Basic routes with header and list view
5. **Integration**: Updates to existing files for seamless integration

### Step 4: Validation & Testing

After generation:
- Check for TypeScript errors and fix any issues
- Verify Convex deployment and database operations
- Test the complete CRUD workflow via sheets/drawers
- Validate responsive design and search functionality

## Best Practices Applied

The generated simple modules will automatically include:

- **Simplified Architecture**: Following transportation-carriers pattern
- **Type Safety**: Full TypeScript coverage with proper inference
- **Performance**: Optimized queries and efficient renders
- **Security**: Authentication checks and input validation
- **Accessibility**: Keyboard navigation and screen reader support
- **Maintainable**: Clear separation of concerns and modular design

## Example Simple Module Request

```
Module Name: waves
Table Name: waves
Display Name: Waves
ID Prefix: WAV

Core Fields:
- name: string (required)
- arrivalStartDate: string (optional)
- arrivalEndDate: string (optional)
- departureStartDate: string (optional)
- departureEndDate: string (optional)

This will be a simple reference module for managing guest arrival waves at events.
```

This will generate a complete waves module following the simple pattern with sheet-based editing and basic search functionality.

## Filter Component Implementation

### Standard Filter Popover Pattern

All filter components should follow the established pattern used in `WaveFilterPopover`:

```tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearch } from "@tanstack/react-router";

export default function ModuleFilterPopover() {
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const defaultValues = useSearch({
    from: "/module-route/",
  }).filters;

  const form = useForm({
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [popoverOpen]);

  const onSubmit = (data: typeof defaultValues) => {
    setPopoverOpen(false);
    navigate({
      to: "/module-route",
      search: (o) => ({ ...o, filters: data }),
    });
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent side="bottom">
          <p>Filter</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-[300px] p-0" align="end">
        <ScrollArea className="w-full max-h-[calc(100svh-300px)] p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="showDeleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Show deleted {moduleName}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Apply Filter
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
```

### Key Filter Implementation Requirements

1. **State Management**: Use TanStack Router's search state for filters
2. **Form Handling**: Implement React Hook Form with proper validation
3. **Navigation Integration**: Use navigate to update URL search parameters
4. **Consistent UI**: Follow the established tooltip + icon button pattern
5. **Responsive Design**: Use ScrollArea for better mobile experience
6. **Form Reset**: Reset form when popover opens to current search state

### Filter Route Integration

Ensure the route schema includes filters:

```typescript
const defaultSearch = {
  q: "",
  columns: ModuleColumn.options,
  sorting: [{ id: "name", desc: false }] as ColumnSort[],
  filters: {
    showDeleted: false,
  },
} as const;

export const indexSearchSchema = z
  .object({
    q: z.coerce.string().default(defaultSearch.q),
    columns: z.array(ModuleColumn).default(defaultSearch.columns),
    sorting: z.array(ModuleSortingSchema).default(defaultSearch.sorting),
    filters: z
      .object({
        showDeleted: z.boolean().default(defaultSearch.filters.showDeleted),
      })
      .default(defaultSearch.filters),
  })
  .default(defaultSearch);
```

### Common Filter Mistakes to Avoid

1. **Static Components**: Don't create non-functional static filter components
2. **Inconsistent Styling**: Always use the tooltip + icon button pattern
3. **Missing State Integration**: Filters must integrate with TanStack Router
4. **Form Validation**: Use React Hook Form, not uncontrolled components
5. **Navigation**: Always use navigate() to update search parameters

## Row Actions Pattern Implementation

### Standard Row Actions in Column Hooks

All `use-{module}-columns.tsx` files should include rowActions following this pattern:

```typescript
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import { toast } from "sonner";
import { RowActionsConfig } from "@/components/data-table-row-actions";
import { PencilIcon, Undo2Icon, XIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const useModuleColumns = () => {
  const destroyModule = useMutation(api.modules.destroy);
  const restoreModule = useMutation(api.modules.restore);
  const navigate = useNavigate();

  const columns: ColumnDef<Row>[] = [
    // ... column definitions
  ];

  // Define row actions configuration
  const rowActions: RowActionsConfig<Row> = {
    items: [
      {
        type: "button",
        label: "Edit {Module}",
        onClick: (row) => {
          navigate({ to: "/modules", search: { showEdit: row.id } });
        },
        disabled: (row) => Boolean(row.protected), // Optional: for protected records
        icon: <PencilIcon className="w-4 h-4" />,
      },
      {
        type: "separator",
      },
      {
        type: "button",
        label: "Restore",
        onClick: (row) => {
          restoreModule({ ids: [row._id] });
          toast.success("{Module} restored");
        },
        hidden: (row) => !row.isDeleted,
        disabled: (row) => Boolean(row.protected), // Optional: for protected records
        icon: <Undo2Icon className="w-4 h-4" />,
      },
      {
        type: "button",
        label: "Delete",
        onClick: (row) => {
          destroyModule({ ids: [row._id] });
          toast.success("{Module} deleted");
        },
        hidden: (row) => Boolean(row.isDeleted),
        disabled: (row) => Boolean(row.protected), // Optional: for protected records
        variant: "destructive",
        icon: <XIcon className="w-4 h-4" />,
      },
    ],
  };

  return { columns, groupBy, rowActions };
};
```

### Route Integration

Update the route component to use rowActions:

```typescript
// In the route component
const { columns, groupBy, rowActions } = useModuleColumns();

// In the DataTable component
<DataTable
  // ... other props
  rowActions={rowActions}
>
```

### Key Row Actions Requirements

1. **Imports**: Always include necessary imports for mutations, toast, and icons
2. **Mutations**: Wire up destroy and restore mutations from Convex API
3. **Navigation**: Use TanStack Router navigate for edit actions
4. **Toast Notifications**: Provide user feedback for successful operations
5. **Conditional Logic**: Use hidden/disabled based on record state
6. **Protected Records**: Implement disabled state for system/protected records
7. **Consistent Icons**: Use standard icons (PencilIcon, Undo2Icon, XIcon)
8. **Destructive Styling**: Use variant="destructive" for delete actions

### Row Actions Mistakes to Avoid

1. **Missing Mutations**: Always import and use the correct Convex mutations
2. **No User Feedback**: Always include toast notifications for actions
3. **Inconsistent Icons**: Use the established icon set consistently
4. **Missing Conditional Logic**: Always implement proper hidden/disabled logic
5. **Route Navigation**: Use correct navigation patterns for edit actions
