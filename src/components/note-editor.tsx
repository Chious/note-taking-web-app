"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Editor from "@/components/editor";
import { useCreateNote, useUpdateNote } from "@/hooks/use-notes";
import {
  type Note,
  type CreateNote,
  type UpdateNote,
  type EditorContent,
} from "@/schemas/notes";
import { Calendar, Tag, Archive, Save, Loader2, X } from "lucide-react";
import { UTFToLocalTime } from "@/lib/time";
// Simple toast implementation - we'll use console.log for now and can enhance later
const useToast = () => ({
  toast: ({
    title,
    description,
    variant,
  }: {
    title: string;
    description: string;
    variant?: string;
  }) => {
    console.log(
      `${variant === "destructive" ? "❌" : "✅"} ${title}: ${description}`
    );
    // In a real implementation, you'd show a proper toast notification
  },
});

interface NoteEditorProps {
  note?: Note;
  onSave?: (note: Note) => void;
  onCancel?: () => void;
  className?: string;
  editorId?: string;
  dataId?: string;
}

export function NoteEditor({
  note,
  onSave,
  onCancel,
  className = "",
  editorId = "note-editor",
  dataId,
}: NoteEditorProps) {
  const { toast } = useToast();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  // Form state
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState<{
    time?: number;
    blocks: unknown[];
    version?: string;
  } | null>(note?.content || null);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [isArchived, setIsArchived] = useState(note?.isArchived || false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update form state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setIsArchived(note.isArchived);
    } else {
      setTitle("");
      setContent(null);
      setTags([]);
      setIsArchived(false);
    }
  }, [note]);

  // Track changes
  useEffect(() => {
    if (!note) {
      setHasUnsavedChanges(title.trim() !== "" || tags.length > 0);
    } else {
      setHasUnsavedChanges(
        title !== note.title ||
          JSON.stringify(tags.sort()) !== JSON.stringify(note.tags.sort()) ||
          isArchived !== note.isArchived
      );
    }
  }, [title, tags, isArchived, note]);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Note title is required",
        variant: "destructive",
      });
      return;
    }

    if (!content || !content.blocks || content.blocks.length === 0) {
      toast({
        title: "Validation Error",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Debug logging
    console.log("Saving note with content:", JSON.stringify(content, null, 2));

    try {
      if (note?.id) {
        // Update existing note
        const updateData: UpdateNote = {
          title: title.trim(),
          content: content as EditorContent,
          tags,
          isArchived,
        };

        const result = await updateNoteMutation.mutateAsync({
          id: note.id,
          data: updateData,
        });

        console.log("PUT note response", result);

        toast({
          title: "Success",
          description: "Note updated successfully",
        });

        onSave?.(result.note);
      } else {
        // Create new note
        const createData: CreateNote = {
          title: title.trim(),
          content: content as EditorContent,
          tags,
        };

        const result = await createNoteMutation.mutateAsync(createData);

        toast({
          title: "Success",
          description: "Note created successfully",
        });

        onSave?.(result.note);

        // Reset form for new note
        setTitle("");
        setTags([]);
        setIsArchived(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }

    if (note) {
      // Reset to original values
      setTitle(note.title);
      setTags(note.tags);
      setIsArchived(note.isArchived);
    } else {
      // Clear form
      setTitle("");
      setTags([]);
      setIsArchived(false);
    }

    onCancel?.();
  };

  const isLoading =
    createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      {/* Title Input */}
      <div className="mb-4 flex-shrink-0">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          className="text-lg font-semibold border-transparent border border-solid shadow-none px-0"
          disabled={isLoading}
        />
      </div>

      {/* Tags Section */}
      <div className="mb-4 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="w-4 h-4" />
          <span>Tags:</span>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 w-4 h-4 hover:bg-transparent"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Archive Status */}
      {note && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <Archive className="w-4 h-4" />
          <span>Status:</span>
          <select
            value={isArchived ? "archived" : "active"}
            onChange={(e) => setIsArchived(e.target.value === "archived")}
            className="bg-white appearance-none border border-border rounded px-2 py-1 text-foreground text-sm"
            disabled={isLoading}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      )}

      {/* Last Edited */}
      {note && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <Calendar className="w-4 h-4" />
          <span>Last edited:</span>
          <span>{UTFToLocalTime(note.lastEdited)}</span>
        </div>
      )}

      {/* Content Editor */}
      <div className="flex-1 mb-4 min-h-0">
        <Editor
          editorId={editorId}
          data={note?.content}
          placeholder="Start writing your note..."
          dataId={dataId}
          onChange={setContent}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end pt-4 border-t border-border flex-shrink-0">
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>Unsaved changes</span>
          </div>
        )}

        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={isLoading || !title.trim()}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {note ? "Update" : "Create"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
