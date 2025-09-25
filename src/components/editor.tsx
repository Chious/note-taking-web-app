'use client';
import { useEffect, useRef, useState, memo } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import { cn } from '@/lib/utils';

interface EditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  className?: string;
  editorId?: string;
}

function Editor({
  data,
  onChange,
  placeholder,
  className,
  editorId = 'editorjs',
}: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!editorRef.current) {
        console.log('Initializing EditorJS');
        const editor = new EditorJS({
          holder: editorId,
          tools: {
            header: Header,
            paragraph: Paragraph,
            list: {
              class: List,
              inlineToolbar: true,
              config: { defaultStyle: 'unordered' },
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+O',
              config: {
                quotePlaceholder: 'Enter a quote',
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
        return;
      }
    }

    init();

    return () => {
      cancelled = true;
      // keep the editor alive across unmount? If you want to always destroy on unmount:
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch {}
      }
    };
  }, [data, editorId, placeholder, onChange]);

  return (
    <div
      className={cn('flex flex-col gap-4 flex-1 min-h-0 max-h-full', className)}
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
