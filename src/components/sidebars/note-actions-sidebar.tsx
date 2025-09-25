import { NoteDialog } from "@/components/note-dialog";

interface NoteActionsSidebarProps {
  noteId: string;
  onSuccess?: () => void;
}

export function NoteActionsSidebar({ noteId, onSuccess }: NoteActionsSidebarProps) {
  return (
    <>
      <NoteDialog 
        triggerText="Archive Note" 
        type="archiveNote" 
        noteId={noteId}
        onSuccess={onSuccess}
      />
      <NoteDialog 
        triggerText="Delete Note" 
        type="deleteNote" 
        noteId={noteId}
        onSuccess={onSuccess}
      />
    </>
  );
}
