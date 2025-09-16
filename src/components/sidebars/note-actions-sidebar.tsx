import { NoteDialog } from "@/components/note-dialog";

export function NoteActionsSidebar() {
  return (
    <>
      <NoteDialog triggerText="Archive Note" type="archiveNote" />
      <NoteDialog triggerText="Delete Note" type="deleteNote" />
    </>
  );
}
