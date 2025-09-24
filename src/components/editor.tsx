"use client";
import { useEffect, useRef, useState, memo } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Delimiter from "@editorjs/delimiter";
import { cn } from "@/lib/utils";

interface EditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  className?: string;
  editorId?: string;
  dataId?: string;
}

function Editor({
  data,
  onChange,
  placeholder,
  className,
  editorId = "editorjs",
  dataId,
}: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);
  const dataIdRef = useRef<string | undefined>(dataId);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!editorRef.current) {
        const editor = new EditorJS({
          holder: editorId,
          tools: {
            header: Header,
            paragraph: Paragraph,
            list: {
              class: List,
              inlineToolbar: true,
              config: { defaultStyle: "unordered" },
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              shortcut: "CMD+SHIFT+O",
              config: {
                quotePlaceholder: "Enter a quote",
                captionPlaceholder: "Quote's author",
              },
            },
            delimiter: Delimiter,
          },
          data,
          placeholder: placeholder || "Let's write an awesome story!",
          onReady: () => {
            if (cancelled) return;
            setIsReady(true);
          },
          onChange: async () => {
            if (!editorRef.current || !onChange) return;
            const output = await editorRef.current.save();
            onChange(output);
          },
        });

        editorRef.current = editor;
        dataIdRef.current = dataId; // record the dataId that this instance currently shows
        return;
      }

      // editor already exists -> maybe re-render new data if dataId changed
      if (dataIdRef.current !== dataId && data && editorRef.current) {
        // wait until editor is ready
        if (editorRef.current.isReady instanceof Promise) {
          try {
            await editorRef.current.isReady;
          } catch {
            /* ignore */
          }
        }

        try {
          // try to clear existing blocks first if available
          editorRef.current.blocks?.clear?.();

          // render new content (some EditorJS versions expose render)
          if (typeof editorRef.current.render === "function") {
            await editorRef.current.render(data);
          } else {
            // fallback: destroy and recreate if render not present
            editorRef.current.destroy();
            editorRef.current = null;
            // After destroy, create a fresh instance (quick re-init)
            const newEditor = new EditorJS({
              holder: editorId,
              tools: {
                header: Header,
                paragraph: Paragraph,
                list: List,
                quote: Quote,
                delimiter: Delimiter,
              },
              data,
              placeholder: placeholder || "Let's write an awesome story!",
              onReady: () => setIsReady(true),
              onChange: async () => {
                if (onChange && editorRef.current) {
                  const output = await editorRef.current.save();
                  onChange(output);
                }
              },
            });
            editorRef.current = newEditor;
          }
        } catch (err) {
          console.error("Editor render error, falling back to recreate:", err);
        }

        dataIdRef.current = dataId; // update the ref so we don't re-render repeatedly
      }
    }

    init();

    return () => {
      cancelled = true;
      // keep the editor alive across unmount? If you want to always destroy on unmount:
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch {}
        editorRef.current = null;
      }
    };
  }, [data, dataId, editorId, placeholder, onChange]);

  return (
    <div
      className={cn("flex flex-col gap-4 flex-1 min-h-0 max-h-full", className)}
    >
      <div
        id={editorId}
        className="prose prose-lg max-w-none border border-gray-200 rounded-lg p-4 flex-1 overflow-y-scroll focus-within:border-blue-500 min-h-0 max-h-full "
      />
      {!isReady && (
        <div className="text-center text-gray-500 mt-4">Loading editor...</div>
      )}
    </div>
  );
}

export default memo(Editor);
