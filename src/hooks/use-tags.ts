"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { type Tag, type TagsResponse } from "@/schemas/notes";

// API functions
async function fetchTags(): Promise<TagsResponse> {
  const response = await fetch("/api/tags", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }

  return response.json();
}

async function createTag(name: string): Promise<{ message: string; tag: Tag }> {
  const response = await fetch("/api/tags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create tag: ${response.statusText}`);
  }

  return response.json();
}

async function updateTag(id: string, name: string): Promise<{ message: string; tag: Tag }> {
  const response = await fetch(`/api/tags/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to update tag: ${response.statusText}`);
  }

  return response.json();
}

async function deleteTag(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/tags/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to delete tag: ${response.statusText}`);
  }

  return response.json();
}

// Cache key factory
const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: () => [...tagKeys.lists()] as const,
};

// Custom hooks
export function useTags() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: fetchTags,
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes (tags change less frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTag,
    onMutate: async (name) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: tagKeys.list() });
      
      // Snapshot the previous value
      const previousTags = queryClient.getQueryData<TagsResponse>(tagKeys.list());
      
      // Optimistically add the new tag
      if (previousTags) {
        const optimisticTag: Tag = {
          id: `temp-${Date.now()}`, // Temporary ID
          name,
          userId: "", // Will be set by server
          noteCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const optimisticTags: TagsResponse = {
          ...previousTags,
          data: {
            ...previousTags.data,
            tags: [...previousTags.data.tags, optimisticTag],
            total: previousTags.data.total + 1,
          },
        };
        
        queryClient.setQueryData(tagKeys.list(), optimisticTags);
        
        if (process.env.NODE_ENV === "development") {
          console.log("🔄 Optimistic tag creation applied:", name);
        }
      }
      
      return { previousTags };
    },
    onError: (error, name, context) => {
      // Rollback on error
      if (context?.previousTags) {
        queryClient.setQueryData(tagKeys.list(), context.previousTags);
        
        if (process.env.NODE_ENV === "development") {
          console.log("↩️ Rollback applied for tag:", name);
        }
      }
      
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Failed to create tag:", error);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch tags to get the real data
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
      
      // Also invalidate notes lists since tag creation might affect note queries
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Tag created and cache updated:", data.tag.name);
      }
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateTag(id, name),
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: tagKeys.list() });
      
      // Snapshot the previous value
      const previousTags = queryClient.getQueryData<TagsResponse>(tagKeys.list());
      
      // Optimistically update the tag
      if (previousTags) {
        const optimisticTags: TagsResponse = {
          ...previousTags,
          data: {
            ...previousTags.data,
            tags: previousTags.data.tags.map((tag) =>
              tag.id === id
                ? { ...tag, name, updatedAt: new Date().toISOString() }
                : tag
            ),
          },
        };
        
        queryClient.setQueryData(tagKeys.list(), optimisticTags);
        
        if (process.env.NODE_ENV === "development") {
          console.log("🔄 Optimistic tag update applied:", name);
        }
      }
      
      return { previousTags };
    },
    onError: (error, { name }, context) => {
      // Rollback on error
      if (context?.previousTags) {
        queryClient.setQueryData(tagKeys.list(), context.previousTags);
        
        if (process.env.NODE_ENV === "development") {
          console.log("↩️ Rollback applied for tag:", name);
        }
      }
      
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Failed to update tag:", error);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch tags to ensure consistency
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
      
      // Also invalidate notes lists since tag updates might affect note queries
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Tag updated and cache synced:", data.tag.name);
      }
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTag,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: tagKeys.list() });
      
      // Snapshot the previous value
      const previousTags = queryClient.getQueryData<TagsResponse>(tagKeys.list());
      
      // Optimistically remove the tag
      if (previousTags) {
        const optimisticTags: TagsResponse = {
          ...previousTags,
          data: {
            ...previousTags.data,
            tags: previousTags.data.tags.filter((tag) => tag.id !== id),
            total: previousTags.data.total - 1,
          },
        };
        
        queryClient.setQueryData(tagKeys.list(), optimisticTags);
        
        if (process.env.NODE_ENV === "development") {
          console.log("🗑️ Optimistic tag deletion applied:", id);
        }
      }
      
      return { previousTags };
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousTags) {
        queryClient.setQueryData(tagKeys.list(), context.previousTags);
        
        if (process.env.NODE_ENV === "development") {
          console.log("↩️ Rollback applied for tag:", id);
        }
      }
      
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Failed to delete tag:", error);
      }
    },
    onSuccess: (data, id) => {
      // Invalidate and refetch tags to ensure consistency
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
      
      // Also invalidate notes lists since tag deletion might affect note queries
      queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
      
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Tag deleted and cache updated:", id);
      }
    },
  });
}

// Utility hook to get tag names for autocomplete/suggestions
export function useTagNames() {
  const { data: tagsResponse } = useTags();
  
  return tagsResponse?.data.tags.map((tag) => tag.name) || [];
}

// Utility hook to get popular tags (by note count)
export function usePopularTags(limit = 10) {
  const { data: tagsResponse } = useTags();
  
  if (!tagsResponse) return [];
  
  return tagsResponse.data.tags
    .filter((tag) => tag.noteCount > 0)
    .sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, limit);
}
