'use client';
import { useEffect, useRef, memo } from 'react';
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
            console.log('EditorJS is ready');
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
      // Clean up editor instance
      if (editorRef.current) {
        try {
          // EditorJS might not have destroy method immediately available
          // or it might be async. Let's try different cleanup approaches
          if (
            editorRef.current.destroy &&
            typeof editorRef.current.destroy === 'function'
          ) {
            editorRef.current.destroy();
          } else if (
            editorRef.current.clear &&
            typeof editorRef.current.clear === 'function'
          ) {
            editorRef.current.clear();
          }
          // Clear the DOM element as fallback
          const element = document.getElementById(editorId);
          if (element) {
            element.innerHTML = '';
          }
        } catch (error) {
          console.error('Error cleaning up editor:', error);
        } finally {
          // Always clear the ref
          editorRef.current = null;
        }
      }
    };
  }, [data, editorId, placeholder, onChange]);

  return (
    <div
      className={cn('h-full w-full overflow-y-scroll', className)}
      role="application"
      aria-label="Rich text editor"
    >
      <div
        id={editorId}
        className="prose max-w-none"
        role="textbox"
        aria-multiline="true"
        aria-label="Note content editor"
        tabIndex={0}
      />
    </div>
  );
}

export default memo(Editor);
