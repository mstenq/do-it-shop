---
mode: agent
tools: ['changes', 'codebase', 'editFiles', 'problems', 'search', 'searchResults', 'convex-mcp']
---

# InEvent Module Generator

An intelligent assistant that creates complete, production-ready modules for the InEvent application following established architectural patterns. This tool generates full-stack features including Convex backend operations, React frontend components, TanStack Router routing, and comprehensive CRUD functionality.

Ask for fields, tabs, and filters if not provided.

## What This Tool Does

This assistant analyzes your existing codebase patterns and generates a complete module that includes:

- **Backend Integration**: Convex database schema, CRUD operations, authentication, and incrementor ID system
- **Frontend Components**: React components following shadcn/ui design system with proper TypeScript types
- **Routing System**: TanStack Router file-based routing with nested layouts and tab navigation
- **Form Management**: React Hook Form with Zod validation schemas
- **Data Management**: Real-time Convex subscriptions with filtering and search capabilities
- **UI/UX Consistency**: Responsive design following your established patterns

The tool will examine your existing modules (like public-transports) to ensure consistency in:

- File naming conventions and folder structure
- Component patterns and TypeScript types
- Form validation and error handling
- Search state management and URL persistence
- Table columns and filtering systems

## Available Tools

The assistant has access to:

- **Code Analysis**: `semantic_search`, `grep_search`, `file_search` for understanding existing patterns
- **File Operations**: `read_file`, `create_file`, `insert_edit_into_file`, `replace_string_in_file` for generating code
- **Project Structure**: `list_dir`, `get_errors` for navigation and validation
- **Convex Integration**: `mcp_convex-mcp_status`, `mcp_convex-mcp_tables`, `mcp_convex-mcp_functionSpec` for database operations

## Module Specification

Create a complete module with backend, frontend components, routes, and CRUD operations following the InEvent project patterns.

## Module Information

**Module Name**: {moduleName} (e.g., "events", "guests", "accommodations")
**Table Name**: {tableName} (e.g., "events", "guests", "accommodations")
**Display Name**: {displayName} (e.g., "Events", "Guests", "Accommodations")
**ID Prefix**: {idPrefix} (3-letter prefix for incrementor IDs, e.g., "EVT", "GST", "ACC")

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
  venueId: v.optional(v.id("vendors")), // foreign key
  capacity: v.optional(v.number()),
  status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
}
```

## Detail Page Tabs

**Tabs to Create**: List the tabs needed for the detail page

- Tab name and route path
- Brief description of tab purpose
- Any badge content or styling

**Example**:

```typescript
[
  { label: "Overview", path: "/$id", description: "Main entity details" },
  {
    label: "Guests",
    path: "/$id/guests",
    description: "Associated guests",
    badgeContent: "count",
  },
  { label: "Tasks", path: "/$id/tasks", description: "Related tasks" },
  { label: "Notes", path: "/$id/notes", description: "Notes and comments" },
  { label: "Log", path: "/$id/log", description: "Activity log" },
];
```

## Filter Options

**Available Filters**: Define filters for the list view

- Filter field name and type
- Filter options or data source
- Default values

**Example**:

```typescript
{
  status: { type: "enum", options: ["draft", "active", "completed"], default: "" },
  venue: { type: "select", source: "vendors", default: "" },
  dateRange: { type: "dateRange", fields: ["after", "before"], default: { after: "", before: "" } },
  capacity: { type: "number", range: [0, 1000], default: "" }
}
```

## Files to Generate

The tool will create the following file structure:

### Backend (Convex)

- `convex/{tableName}.ts` - CRUD operations (all, get, add, update, delete)
- Update `convex/schema.ts` - Add table schema definition
- Update `convex/incrementors.ts` - Add ID prefix mapping

### Frontend Module

- `src/modules/{moduleName}/index.ts` - Public API exports
- `src/modules/{moduleName}/types.ts` - TypeScript definitions
- `src/modules/{moduleName}/{moduleName}Const.ts` - Constants and utilities
- `src/modules/{moduleName}/use-{moduleName}-data.ts` - Data fetching hook
- `src/modules/{moduleName}/use-{moduleName}-columns.tsx` - Table columns
- `src/modules/{moduleName}/{moduleName}-form.tsx` - Create/edit form
- `src/modules/{moduleName}/{moduleName}-filter-popover.tsx` - Filter component with TanStack Router integration
- `src/modules/{moduleName}/new-{moduleName}.tsx` - Create modal/sheet
- `src/modules/{moduleName}/edit-{moduleName}.tsx` - Edit modal/sheet

### Routes

- `src/routes/{moduleName}.tsx` - Layout route with header
- `src/routes/{moduleName}.index.tsx` - List view with table
- `src/routes/{moduleName}.$id.tsx` - Detail layout with tabs
- `src/routes/{moduleName}.$id.index.tsx` - Detail overview tab
- `src/routes/{moduleName}.$id.{tabName}.tsx` - Additional tabs (generated based on tabs list)

## Implementation Pattern

### 1. Backend Setup

- Add table schema to Convex with proper indexes
- Create CRUD operations with authentication
- Add incrementor prefix for friendly IDs
- Include soft delete pattern where appropriate

### 2. Module Structure

- Follow established patterns from public-transports module
- Include proper TypeScript types throughout
- Implement form validation with Zod schemas
- Add proper error handling and loading states

### 3. Route Configuration

- Set up file-based routing with TanStack Router
- Include search state management and persistence
- Add breadcrumb navigation and page titles
- Implement proper tab navigation with badges

### 4. UI Components

- Use shadcn/ui components consistently
- Implement responsive design patterns
- Add proper loading and error states
- Include accessibility features

### 5. Data Management

- Use Convex for real-time data subscriptions
- Implement optimistic updates where appropriate
- Add proper data filtering and sorting
- Include pagination for large datasets

## Generated Code Features

- **Type Safety**: Full TypeScript coverage with proper type inference
- **Form Validation**: Zod schemas for client and server validation
- **Real-time Updates**: Convex subscriptions for live data
- **Search & Filter**: Advanced filtering with URL state persistence
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: Keyboard navigation and screen reader support
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton loading and optimistic updates

## Usage Instructions & Workflow

### Step 1: Analysis Phase

The assistant will first analyze your existing codebase to understand:

- Current module patterns and structure
- Existing Convex schemas and table relationships
- Component patterns and styling conventions
- Routing patterns and search state management
- Form validation and error handling approaches

### Step 2: Information Gathering

You'll be asked to provide:

- **Module Information**: Name, table name, display name, and ID prefix
- **Field Definitions**: Data structure with types, validation, and relationships
- **Tab Configuration**: Detail page tabs with descriptions and badges
- **Filter Specifications**: Available filters for the list view with types and options

### Step 3: Code Generation

The assistant will generate all necessary files:

1. **Backend First**: Convex schema, CRUD operations, and incrementor updates
2. **Module Structure**: TypeScript types, constants, and utility functions
3. **Components**: Forms, filters, modals, and data hooks following your patterns
4. **Routing**: File-based routes with proper search state management
5. **Integration**: Updates to existing files for seamless integration

### Step 4: Validation & Testing

After generation:

- Check for TypeScript errors and fix any issues
- Verify Convex deployment and database operations
- Test the complete CRUD workflow
- Validate responsive design and accessibility
- Ensure search and filter functionality works correctly

### Step 5: Customization

Review and customize the generated code:

- Adjust form fields and validation rules
- Modify table columns and display formatting
- Customize filter options and default values
- Add business logic specific to your use case
- Enhance UI/UX based on specific requirements

## Best Practices Applied

The generated modules will automatically include:

- **Consistent Architecture**: Following established InEvent patterns
- **Type Safety**: Full TypeScript coverage with proper inference
- **Performance**: Optimized queries, proper indexing, and efficient renders
- **Security**: Authentication checks and input validation
- **Accessibility**: Keyboard navigation and screen reader support
- **Testing Ready**: Structure supports unit and integration testing
- **Maintainable**: Clear separation of concerns and modular design

## Prerequisites

Before using this tool, ensure:

- Convex development environment is set up and running
- All dependencies are installed (`bun install`)
- You have a clear understanding of the domain model
- Related entities (like vendors, categories) exist if referenced
- You have design mockups or wireframes for complex UIs

## Example Generation Request

```
Module Name: events
Table Name: events
Display Name: Events
ID Prefix: EVT

Core Fields:
- name: string (required)
- description: string (optional)
- startDate: string (optional)
- endDate: string (optional)
- venueId: Id<"vendors"> (optional)
- capacity: number (optional)
- status: "draft" | "active" | "completed" (required, default: "draft")

Detail Tabs:
- Overview (/$id) - Main event details
- Guests (/$id/guests) - Event attendees with count badge
- Activities (/$id/activities) - Event activities
- Tasks (/$id/tasks) - Related tasks
- Notes (/$id/notes) - Event notes
- Log (/$id/log) - Activity log

Filters:
- status: enum ["", "draft", "active", "completed"]
- venue: select from vendors
- dateRange: after/before date filters
- capacity: number range filter
```

This will generate a complete events module following all InEvent architectural patterns and best practices.
