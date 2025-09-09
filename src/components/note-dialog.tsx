import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash, Archive } from "lucide-react";

type DialogType = "deleteNote" | "archiveNote";

type DialogContent = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const dialogContent: Record<DialogType, DialogContent> = {
  deleteNote: {
    icon: <Trash />,
    title: "Delete Note",
    description:
      "Are you sure you want to permanently delete this note? This action cannot be undone.",
  },
  archiveNote: {
    icon: <Archive />,
    title: "Archive Note",
    description:
      "Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime.",
  },
};

export function NoteDialog({
  triggerText,
  type = "deleteNote",
}: {
  triggerText: string;
  type: DialogType;
}) {
  const { title, description, icon } =
    dialogContent[type] || dialogContent.deleteNote;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {icon} {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="size-12 bg-muted rounded-lg p-2 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex flex-col gap-2 text-start">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            className={
              type === "deleteNote"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
