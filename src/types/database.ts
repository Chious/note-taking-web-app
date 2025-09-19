import type { User, Note } from "@/lib/schema";

export type UserWithNotes = User & {
  notes: Note[];
};

export type NoteWithUser = Note & {
  user: User;
};

export type CreateUserData = {
  email: string;
  password: string;
};

export type CreateNoteData = {
  userId: string;
  title: string;
  content: string;
  tags?: string;
};

export type UpdateNoteData = {
  title?: string;
  content?: string;
  tags?: string;
  isArchived?: boolean;
  lastEdited?: Date;
};

// Helper function to parse tags from string to array
export const parseTags = (tagsString: string): string[] => {
  return tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
};

// Helper function to format tags from array to string
export const formatTags = (tags: string[]): string => {
  return tags.join(",");
};
