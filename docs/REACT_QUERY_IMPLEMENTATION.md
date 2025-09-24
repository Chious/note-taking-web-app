# React Query Implementation

This document describes the React Query implementation for client-side caching and data management in the note-taking web app.

## Overview

The application uses TanStack Query (React Query) for robust client-side caching, fetching, and mutation of notes and tags data. This provides:

- **Automatic caching** with configurable stale times
- **Background revalidation** for fresh data
- **Optimistic updates** for better UX
- **Cache invalidation** on mutations
- **Prefetching** for improved performance
- **Error handling and retry logic**

## Architecture

### Query Provider Setup

The `QueryProvider` component wraps the entire application and provides:

```typescript
// src/providers/query-provider.tsx
- QueryClient with optimized default options
- React Query DevTools for development
- Session integration with NextAuth
- Retry logic for queries and mutations
- Stale time: 5 minutes
- Cache time: 10 minutes
```

### Custom Hooks

#### Notes Hooks (`src/hooks/use-notes.ts`)

- **`useNotes(params)`** - Fetch notes with search/filter parameters
- **`useNote(id)`** - Fetch a single note by ID
- **`useCreateNote()`** - Create a new note with optimistic updates
- **`useUpdateNote()`** - Update a note with optimistic updates
- **`useDeleteNote()`** - Delete a note with optimistic updates
- **`usePrefetchNote()`** - Prefetch note data on hover/focus

#### Tags Hooks (`src/hooks/use-tags.ts`)

- **`useTags()`** - Fetch all tags
- **`useCreateTag()`** - Create a new tag with optimistic updates
- **`useUpdateTag()`** - Update a tag with optimistic updates
- **`useDeleteTag()`** - Delete a tag with optimistic updates
- **`useTagNames()`** - Get tag names for autocomplete
- **`usePopularTags(limit)`** - Get popular tags by note count

## Cache Strategy

### Cache Keys

The implementation uses a hierarchical cache key structure:

```typescript
// Notes
const noteKeys = {
  all: ["notes"],
  lists: () => [...noteKeys.all, "list"],
  list: (params) => [...noteKeys.lists(), params],
  details: () => [...noteKeys.all, "detail"],
  detail: (id) => [...noteKeys.details(), id],
};

// Tags
const tagKeys = {
  all: ["tags"],
  lists: () => [...tagKeys.all, "list"],
  list: () => [...tagKeys.lists()],
};
```

### Cache Invalidation

- **Notes mutations** invalidate both note lists and related note details
- **Tag mutations** invalidate tag lists and note lists (since tags affect note queries)
- **Cross-invalidation** ensures data consistency across related queries

## Optimistic Updates

### Implementation Pattern

All mutations implement optimistic updates using the `onMutate` callback:

1. **Cancel outgoing queries** to prevent race conditions
2. **Snapshot previous data** for rollback capability
3. **Apply optimistic update** to cache immediately
4. **Rollback on error** using the snapshot
5. **Sync with server response** on success

### Example: Note Update

```typescript
onMutate: async ({ id, data }) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey: noteKeys.detail(id) });

  // Snapshot previous value
  const previousNote = queryClient.getQueryData<NoteResponse>(
    noteKeys.detail(id)
  );

  // Optimistically update the cache
  if (previousNote) {
    const optimisticNote = {
      ...previousNote.note,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    queryClient.setQueryData(noteKeys.detail(id), {
      ...previousNote,
      note: optimisticNote,
    });
  }

  return { previousNote };
};
```

## Performance Features

### Prefetching

Notes are prefetched on hover to improve perceived performance:

```typescript
// In component
const prefetchNote = usePrefetchNote();

// On note hover
<Button onMouseEnter={() => prefetchNote(noteId)}>
```

### Background Revalidation

- **Stale-while-revalidate** pattern shows cached data immediately
- **Background refetch** updates data when it becomes stale
- **No loading states** for revalidated data

### Cache Configuration

```typescript
// Default query options
{
  staleTime: 5 * 60 * 1000,    // 5 minutes
  gcTime: 10 * 60 * 1000,      // 10 minutes
  refetchOnWindowFocus: false,  // Disabled for better UX
  retry: (failureCount, error) => {
    // Smart retry logic based on error type
  }
}
```

## Error Handling

### Retry Logic

- **Queries**: Retry up to 3 times, skip 4xx errors
- **Mutations**: Retry up to 2 times, skip 4xx errors
- **Exponential backoff** handled by React Query

### Error States

- **Query errors** show user-friendly error messages
- **Mutation errors** trigger optimistic update rollback
- **Network errors** are handled gracefully with retry

## Development Tools

### React Query DevTools

Available in development mode for debugging:

- **Query inspector** shows all active queries
- **Cache viewer** displays cached data
- **Mutation tracker** monitors mutation states
- **Performance metrics** for optimization

### Logging

Development-only logging for cache operations:

```typescript
if (process.env.NODE_ENV === "development") {
  console.log("✅ Note created and cache updated:", data.note.id);
  console.log("🔄 Optimistic update applied for note:", id);
  console.log("↩️ Rollback applied for note:", id);
}
```

## Integration Points

### API Integration

- **Credentials included** for authenticated requests
- **Error handling** with proper HTTP status codes
- **Type safety** with Zod schemas
- **Consistent response format** across all endpoints

### UI Integration

- **Loading states** during initial fetch
- **Skeleton states** for better perceived performance
- **Error boundaries** for graceful error handling
- **Optimistic UI updates** for immediate feedback

## Best Practices

### Cache Management

1. **Use stable cache keys** for consistent caching
2. **Invalidate related queries** after mutations
3. **Prefer optimistic updates** for better UX
4. **Handle rollbacks** gracefully on errors

### Performance

1. **Prefetch on user interaction** (hover, focus)
2. **Use appropriate stale times** based on data freshness needs
3. **Implement pagination** for large datasets
4. **Monitor cache size** and implement cleanup

### Error Handling

1. **Provide meaningful error messages** to users
2. **Implement retry logic** for transient failures
3. **Handle offline scenarios** gracefully
4. **Log errors** for debugging

## Future Enhancements

- **Infinite queries** for pagination
- **Real-time updates** with WebSocket integration
- **Offline support** with background sync
- **Cache persistence** across sessions
- **Advanced prefetching** strategies
