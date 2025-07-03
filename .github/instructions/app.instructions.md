---
applyTo: "**"
---

# InEvent - Event Management System

## Project Overview

InEvent is a comprehensive event management system built with modern web technologies to handle complex event logistics including guest management, activities, transportation, vendor coordination, and scheduling.

## Tech Stack

### Backend

- **Convex**: Real-time database and backend-as-a-service
- **Clerk**: Authentication and user management
- **Convex Helpers**: Utilities for enhanced Convex functionality

### Frontend

- **React 19**: UI framework with latest features
- **TanStack Router**: File-based routing with type safety
- **TypeScript**: Full type safety across the application
- **Vite**: Fast build tool and development server

### UI & Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components built on Radix UI
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form state management with Zod validation

### Development Tools

- **Bun**: Package manager and runtime
- **React Compiler**: Experimental React optimization
- **Concurrently**: Run multiple dev processes
- **Auto-animate**: Smooth animations for UI transitions

## Domain Models

### Core Entities

- **Events**: Main event container with organization context
- **Tasks**: Todo items and action items
- **Public Transports**: Flight, bus, rail, ship transportation
- **Transportation Carriers**: Airlines, bus companies, etc.
- **Vendors**: Service providers, venues, suppliers
- **Vendor Categories**: Classification of vendor types
- **Vendor Areas**: Geographic or functional areas
- **Views**: Custom data views for different user perspectives

### Key Features

- Multi-tenant architecture with organization support
- Soft delete patterns for data integrity
- Incremental ID generation for user-friendly references
- Geolocation support for vendors
- Time tracking for transportation logistics
- Custom views and filtering system

## Architecture Patterns

### Module Organization

All feature modules should be organized under `src/modules/` with the following structure:

```
src/modules/
  feature-name/
    index.ts                    # Public API exports
    types.ts                    # Type definitions
    constants.ts                # Feature constants
    hooks/                      # Custom hooks
      use-feature-data.tsx
      use-feature-mutations.tsx
    components/
      feature-list.tsx          # List/table views
      feature-form.tsx          # Create/edit forms
      feature-details.tsx       # Detail views
      feature-filters.tsx       # Filter components
    utils/                      # Feature-specific utilities
    queries/                    # Convex query wrappers
    mutations/                  # Convex mutation wrappers
```

### Routing Structure

Follow TanStack Router file-based routing conventions:

- `routes/feature.tsx` - Layout route
- `routes/feature.index.tsx` - List view
- `routes/feature.$id.tsx` - Detail layout
- `routes/feature.$id.index.tsx` - Detail view
- `routes/feature.$id.edit.tsx` - Edit view

### Data Flow

1. **Convex Functions**: Server-side data operations
2. **Custom Hooks**: Client-side data fetching and mutations
3. **Components**: UI presentation and user interaction
4. **Forms**: React Hook Form with Zod validation

## Coding Standards

### File Naming

- Use kebab-case for files and folders
- Use PascalCase for React components
- Use camelCase for functions and variables
- Use SCREAMING_SNAKE_CASE for constants

### Component Structure

```tsx
// 1. Imports (external libraries first, then internal)
import React from "react";
import { useQuery } from "convex/react";

// 2. Types
interface ComponentProps {
  // props definition
}

// 3. Component
export function ComponentName({ prop }: ComponentProps) {
  // 4. Hooks
  const data = useQuery(api.table.list);

  // 5. Early returns
  if (!data) return <LoadingSpinner />;

  // 6. Render
  return <div>{/* JSX content */}</div>;
}
```

### State Management

- Use Convex for server state
- Use React hooks for local component state
- Use React Hook Form for form state
- Avoid prop drilling - prefer context or Convex subscriptions

### Error Handling

- Use React Error Boundaries for component errors
- Handle async errors in mutations and queries
- Provide user-friendly error messages
- Log errors for debugging

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use Zod for runtime validation
- Avoid `any` type - use `unknown` when necessary
- Export types from dedicated `types.ts` files

### UI/UX Standards

- Follow shadcn/ui design system
- Maintain consistent spacing using Tailwind scale
- Use semantic HTML elements
- Implement proper loading states
- Provide feedback for user actions
- Ensure keyboard navigation support
- Implement responsive design patterns

### Performance Optimization

- Use React.memo for expensive components
- Implement proper loading states
- Optimize Convex queries with appropriate indexes
- Use code splitting for large modules
- Implement virtual scrolling for large lists

### Testing Strategy

- Write unit tests for utility functions
- Test React components with React Testing Library
- Test Convex functions with Convex testing utilities
- Implement E2E tests for critical workflows

## Development Workflow

### Getting Started

```bash
bun install                 # Install dependencies
bun run dev:all            # Start both frontend and Convex dev servers
```

### Code Quality

- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Create comprehensive PR descriptions

### Feature Development

1. Plan the data model in Convex schema
2. Create necessary Convex functions
3. Set up the module structure
4. Implement components and routes
5. Add proper error handling and loading states
6. Write tests
7. Update documentation

## Future Modules to Implement

Based on the event management domain, consider implementing these modules:

- **guests**: Guest registration, check-in, preferences
- **activities**: Event activities, scheduling, capacity management
- **accommodations**: Hotel bookings, room assignments
- **transfers**: Ground transportation between venues
- **vehicles**: Fleet management, driver assignments
- **schedules**: Timeline management, conflict resolution
- **communications**: Email, SMS, notifications
- **reporting**: Analytics, attendance tracking
- **budget**: Cost tracking, vendor payments
- **documents**: File management, contracts
- **staff**: Team management, role assignments

## Security Considerations

- All data operations go through Convex with proper authentication
- Use Clerk for secure user authentication
- Implement role-based access control
- Validate all user inputs with Zod schemas
- Sanitize data before database operations
- Follow OWASP security guidelines

## Performance Guidelines

- Implement pagination for large datasets
- Use Convex indexes for efficient queries
- Optimize bundle size with code splitting
- Implement proper caching strategies
- Monitor Core Web Vitals
- Use React DevTools for performance profiling
