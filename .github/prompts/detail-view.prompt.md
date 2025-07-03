# Detail View Generator

Create a comprehensive detail view system for a Convex table with a layout route and tabbed navigation.

## Required Information

- **Table Name**: The Convex table name (e.g., `vendors`, `employees`, `events`)
- **Module Name**: The module/feature name in kebab-case (e.g., `vendors`, `public-transports`)
- **Tabs**: List of tab names and their purposes (e.g., `overview`, `map`, `website`, `notes`, `activity`)

## Structure to Generate

```
src/routes/
  {module-name}.$id.tsx           # Layout route with sidebar details
  {module-name}.$id.index.tsx     # Default tab (overview/details)
  {module-name}.$id.{tab}.tsx     # Additional tab routes
```

## Layout Route Pattern (`{module-name}.$id.tsx`)

The layout route should:

1. **Header Section**:
   - Display record ID badge (e.g., `# {record.id}`)
   - Edit button linking to edit form
   - Spacer component for layout

2. **Sidebar Details** (left panel, `xl:min-w-[380px]`):
   - Primary information display
   - Key fields with proper typography hierarchy
   - Related data with appropriate icons
   - Action buttons for external links
   - Responsive layout considerations

3. **Main Content Area** (right panel):
   - PageTabs component for navigation
   - Outlet for tab content
   - Proper spacing and layout

4. **Key Features**:
   - Use `useQuery` from `convex-helpers/react/cache`
   - Implement proper loading states
   - Use utility functions for data formatting
   - Include relevant Lucide icons
   - Follow responsive design patterns

## Tab Route Patterns

### Index Route (`{module-name}.$id.index.tsx`)

The default overview tab should:
- Display comprehensive information in Card components
- Group related information logically
- Use proper icons from Lucide React
- Include placeholder sections for future expansion
- Handle empty states gracefully

### Specialized Tab Routes

Each specialized tab should:
- Handle cases where required data is missing
- Provide meaningful empty states with icons and descriptions
- Include external action buttons where appropriate
- Use proper Card layouts for content organization

## Code Patterns to Follow

### Imports Structure
```tsx
import { api } from "@convex/api";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTabs } from "@/components/page-tabs";
import { Spacer } from "@/components/spacer";
// Utility imports and icons
```

### Component Structure
```tsx
export const Route = createFileRoute("/{module-name}/$id")({
  beforeLoad: async ({ context, params }) => {
    return {
      title: params.id,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const record = useQuery(api.{tableName}.get, { id });

  if (!record) return null;

  // Utility function calls for data formatting
  
  return (
    // Layout JSX
  );
}
```

### Responsive Layout Pattern
```tsx
<div className="flex flex-col h-full gap-4 xl:flex-row">
  {/* Sidebar */}
  <div className="xl:min-w-[380px] py-4 pl-4">
    {/* Header with ID and Edit button */}
    {/* Details sections */}
  </div>
  
  {/* Main content */}
  <main className="w-full h-full p-4 border-l">
    <PageTabs tabs={tabsArray} />
    <div className="pt-4">
      <Outlet />
    </div>
  </main>
</div>
```

### Data Display Patterns

#### Basic Information Display
```tsx
<div>
  <div className="text-xs text-muted-foreground">Label</div>
  <div className="text-lg font-semibold">{record.field}</div>
</div>
```

#### Information with Icons
```tsx
<div className="flex items-center gap-1">
  <IconComponent className="w-3 h-3" />
  <span>{record.field}</span>
</div>
```

#### External Links
```tsx
<a
  href={record.url}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
>
  <ExternalLinkIcon className="w-3 h-3" />
  <span className="text-sm break-all">{record.url}</span>
</a>
```

## Empty State Patterns

### No Data Available
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <AlertCircleIcon className="w-5 h-5 text-muted-foreground" />
      No {Feature} Data
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="py-8 text-center">
      <RelevantIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="mb-2 text-muted-foreground">
        This {entity} doesn't have {feature} information configured.
      </p>
      <p className="text-sm text-muted-foreground">
        Add {requirements} to display the {feature}.
      </p>
    </div>
  </CardContent>
</Card>
```

## Required Dependencies

Ensure these components and utilities are available:
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/page-tabs`
- `@/components/spacer`
- `convex-helpers/react/cache`
- Lucide React icons
- Module-specific utility functions

## Styling Guidelines

- Use Tailwind CSS classes consistently
- Follow responsive design patterns (`xl:`, `md:`, etc.)
- Use proper spacing with gap utilities
- Implement proper typography hierarchy
- Use semantic color classes (`text-muted-foreground`, etc.)
- Ensure proper contrast and accessibility

## Best Practices

1. **Performance**: Use React.memo for expensive components if needed
2. **Accessibility**: Include proper ARIA labels and semantic HTML
3. **Error Handling**: Implement proper loading and error states
4. **TypeScript**: Use proper typing for all props and data
5. **Modularity**: Keep components focused and reusable
6. **Consistency**: Follow established patterns from existing routes

## Example Tab Configurations

### Basic Entity (3 tabs)
- `index`: Overview/Details
- `notes`: Notes and comments
- `activity`: Activity log

### Location-Based Entity (4 tabs)
- `index`: Overview/Details  
- `map`: Location and mapping
- `notes`: Notes and comments
- `activity`: Activity log

### Web-Enabled Entity (4 tabs)
- `index`: Overview/Details
- `website`: Website preview
- `notes`: Notes and comments
- `activity`: Activity log

### Complex Entity (5+ tabs)
- `index`: Overview/Details
- `map`: Location information
- `website`: Website preview
- `relationships`: Related entities
- `notes`: Notes and comments
- `activity`: Activity log

## Convex Integration

Ensure the following Convex functions exist:
- `api.{tableName}.get` - Get single record by ID
- Proper error handling for missing records
- Type safety with generated Convex types

The prompt should generate routes that integrate seamlessly with the existing InEvent architecture and follow established patterns for consistency and maintainability.
