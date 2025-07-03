---
mode: agent
tools: ['changes', 'codebase', 'editFiles', 'problems', 'runCommands', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'convex-mcp']
---
# New Data Model Implementation Prompt

## Overview
This prompt guides the implementation of a new data model in the InEvent system with all necessary components including schema, queries, mutations, search integration, and triggers.

## Prerequisites
- Determine the table name (use kebab-case, e.g., `event-guests`)
- Define the core fields specific to your domain
- Identify relationships to other tables
- Choose appropriate validation types

## Implementation Checklist

### 1. Schema Definition (`convex/schema.ts`)

Add the new table to the schema with these standard fields plus your domain-specific fields:

```typescript
// Add to tableName union
export const tableName = v.union(
  // ...existing literals...
  v.literal("yourNewTable") // Add your table name here
);

// Add table definition
yourNewTable: defineTable({
  // Standard fields (required for all tables)
  id: v.string(),
  isDeleted: v.optional(v.boolean()),
  searchIndex: v.optional(v.string()),
  
  // Domain-specific fields
  name: v.string(), // Most tables have a name field
  description: v.optional(v.string()),
  // Add other fields as needed...
})
  .searchIndex("search", {
    searchField: "searchIndex",
    filterFields: ["isDeleted"],
  }),
```

### 2. Incrementor Setup (`convex/incrementors.ts`)

Add the table prefix to the `tablePrefixes` object:

```typescript
const tablePrefixes: Record<Infer<typeof tableName>, string> = {
  // ...existing prefixes...
  yourNewTable: "YNT", // Use 3-letter prefix for your table
};
```

### 3. Convex Functions (`convex/yourNewTable.ts`)

Create a new file with the following structure based on the `publicTransports.ts` pattern:

```typescript
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authMutation, authQuery, joinData, NullP } from "./utils";

/**
 * Queries
 */
export const all = authQuery({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("yourNewTable")
      .collect();

    // Filter out deleted records unless explicitly requested
    const filteredRecords = !args.includeDeleted
      ? records.filter((record) => !record.isDeleted)
      : records;

    // Join related data if needed
    const joinedRecords = await joinData(filteredRecords, {
      // Add joins for related tables
      // relatedTable: (r) => r.relatedTableId ? ctx.db.get(r.relatedTableId) : NullP,
    });

    return joinedRecords;
  },
});

export const get = authQuery({
  args: { _id: v.string() },
  handler: async (ctx, args) => {
    if (!args._id) {
      return null;
    }
    const record = await ctx.db.get(args._id as Id<"tableName">);

    if (!record) {
      return null;
    }

    // Join related data if needed
    const [joinedRecord] = await joinData([record], {
      // Add joins for related tables or generate URLs for file storage
        photo: (record) =>
          record.photoStorageId
            ? ctx.storage.getUrl(record.photoStorageId)
            : NullP,
    });

    return joinedRecord;
  },
});

const commonArgs = {
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  // Add other field validations here
};

/**
 * Mutations
 */
export const add = authMutation({
  args: {
    ...commonArgs,
    name: v.string(), // Make required fields non-optional
    // Other required fields...
  },
  handler: async (ctx, args) => {
    const nextAvailableId: string = await ctx.runMutation(
      internal.incrementors.getNextId,
      {
        tableName: "yourNewTable",
      }
    );

    await ctx.db.insert("yourNewTable", {
      ...args,
      id: nextAvailableId,
      isDeleted: false,
    });

    return nextAvailableId;
  },
});

export const update = authMutation({
  args: {
    _id: v.id("yourNewTable"),
    ...commonArgs,
  },
  handler: async (ctx, { _id, ...args }) => {
    await ctx.db.patch(_id, {
      ...args,
    });
    return;
  },
});

export const destroy = authMutation({
  args: { ids: v.array(v.id("yourNewTable")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: true });
    }
    return args.ids;
  },
});

export const restore = authMutation({
  args: { ids: v.array(v.id("yourNewTable")) },
  handler: async (ctx, args) => {
    for (const _id of args.ids) {
      await ctx.db.patch(_id, { isDeleted: false });
    }
    return args.ids;
  },
});
```

### 4. Trigger Registration (`convex/triggers.ts`)

Add a trigger to maintain the searchIndex field:

```typescript
triggers.register("yourNewTable", async (ctx, change) => {
  console.log("YourNewTable trigger", change);
  if (change.newDoc) {
    // Build search index from relevant fields
    const searchParts = [
      change.newDoc.id,
      change.newDoc.name,
      change.newDoc.description,
      // Add other searchable fields
    ].filter(Boolean);

    // Add related data to search index if needed
    // const relatedRecord = change.newDoc.relatedTableId
    //   ? await ctx.db.get(change.newDoc.relatedTableId)
    //   : null;
    // if (relatedRecord) {
    //   searchParts.push(relatedRecord.name);
    // }

    const searchIndex = searchParts.join(" ");

    // Update denormalized field. Check first to avoid recursion
    if (change.newDoc.searchIndex !== searchIndex) {
      await ctx.db.patch(change.id, { searchIndex });
    }
  }
});
```

### 5. Search Integration (`convex/search.ts`)

Add the new table to the global search:

```typescript
export const all = authQuery({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    console.log("Search query:", args.q);
    
    // ...existing search queries...

    const yourNewTableResults = await ctx.db
      .query("yourNewTable")
      .withSearchIndex("search", (q) =>
        q
          .search("searchIndex", args.q)
          .eq("isDeleted", false)
      )
      .take(10);

    // Join related data if needed for search results
    const joinedYourNewTableResults = await joinData(yourNewTableResults, {
      // Add joins as needed
    });

    const searchResults: SearchResultItem[] = [
      // ...existing search results...
      
      ...(joinedYourNewTableResults ?? []).map(
        (record) =>
          ({
            _id: String(record._id),
            id: record.id,
            table: "yourNewTable",
            title: record.name,
            subtitle: record.description ?? "",
          }) satisfies SearchResultItem
      ),
    ];

    console.log("Search results:", searchResults);
    return searchResults;
  },
});
```

## Reference Examples

Use these existing implementations as references:

### Complete Example
- **publicTransports**: Full implementation with relationships, search, and triggers

### Schema Patterns
- **vendors**: Complex table with address fields and geolocation
- **transportationCarriers**: Simple table with basic fields
- **vehicleTypes**: Table with file storage integration

### Search Integration
- **vendors**: Basic search implementation
- **publicTransports**: Search with joined data

## Validation Checklist

After implementation, verify:

- [ ] Schema includes all standard fields (id, isDeleted, searchIndex)
- [ ] Proper indexes are defined (search)
- [ ] Incrementor prefix is added to tablePrefixes
- [ ] All CRUD operations work (add, update, destroy, restore)
- [ ] Trigger updates searchIndex correctly
- [ ] Search integration returns expected results

## Common Pitfalls to Avoid

1. **Missing isDeleted filter**: Always filter out deleted records in queries unless explicitly including them
2. **Trigger recursion**: Check if searchIndex has changed before updating to avoid infinite loops
3. **Missing auth**: All queries and mutations must use authQuery/authMutation
4. **Index naming**: Use consistent naming pattern for indexes
5. **Search performance**: Limit search results with .take() to avoid large payloads

This prompt ensures consistent implementation of new data models with all necessary do-it-shop system components.
