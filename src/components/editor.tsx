"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Delimiter from "@editorjs/delimiter";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface EditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  className?: string;
  editorId?: string;
}

export default function Editor({
  data,
  onChange,
  placeholder,
  className,
  editorId = "editorjs",
}: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleChange = useCallback(async () => {
    if (onChange && editorRef.current) {
      const content = await editorRef.current.save();
      onChange(content);
    }
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: editorId,
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
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
        data: data,
        onChange: handleChange,
        placeholder: placeholder || "Let's write an awesome story!",
      });

      editorRef.current = editor;
      editor.isReady.then(() => {
        setIsReady(true);
      });
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [data, handleChange, placeholder, editorId]);

  const saveData = async () => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();
        console.log("Article data: ", outputData);
        return outputData;
      } catch (error) {
        console.log("Saving failed: ", error);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 flex-1 min-h-0", className)}>
      <div
        id={editorId}
        className="prose prose-lg max-w-none border border-gray-200 rounded-lg p-4 flex-1 overflow-y-auto focus-within:border-blue-500 min-h-0"
      />

      {!isReady && (
        <div className="text-center text-gray-500 mt-4">Loading editor...</div>
      )}

      <div className="border-t border-solid border-border" />

      <div className="hidden md:flex lg:flex gap-2 justify-start h-fit shrink-0">
        <Button onClick={saveData}>Save Note</Button>
        <Button variant="secondary">Cancel</Button>
      </div>
    </div>
  );
}
