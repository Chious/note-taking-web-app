import { NoteDialog } from "@/components/note-dialog";
import { Button } from "@/components/ui/button";
import data from "@/data/data.json";
import { Calendar, Tag } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <section className="flex h-full w-full">
      <nav className="flex-col gap-4 p-4 w-1/4 overflow-y-scroll max-h-full hidden md:flex lg:flex">
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Create Note
        </Button>
        {data.notes.map((item) => (
          <Button
            key={item.slug}
            className="w-full h-fit flex items-start flex-col gap-4 justify-between text-left border border-solid bg-secondary text-secondary-foreground hover:bg-muted border-border p-4 whitespace-normal"
          >
            <Link href={`/dashboard/notes/${item.slug}`}>
              <h2 className="text-lg font-bold break-words">{item.title}</h2>
              <span className="text-sm text-muted-foreground flex gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm text-white rounded-md bg-neutral-600 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </span>
              <span className="text-muted-foreground">{item.lastEdited}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <section className="p-4 flex-1 h-full flex item-start justify-start flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          {data.notes[0].title}
        </h1>
        <div className="text-muted-foreground flex items-center gap-2">
          <Tag className="w-4 h-4" /> Tags: {data.notes[0].tags.join(", ")}
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Created At:{" "}
          {data.notes[0].lastEdited}
        </div>
        <div className="border border-solid border-border w-full" />
        <article className="flex-1 text-foreground">
          {data.notes[0].content}
        </article>
        <footer className="flex gap-2">
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            Save Note
          </Button>
          <Button
            variant="secondary"
            className="bg-secondary text-secondary-foreground hover:bg-muted"
          >
            Cancel
          </Button>
        </footer>
      </section>
      <nav className="flex-col gap-4 p-4 w-1/4 hidden md:flex lg:flex">
        <NoteDialog triggerText="Archive Note" type="archiveNote" />
        <NoteDialog triggerText="Delete Note" type="deleteNote" />
      </nav>
    </section>
  );
}
