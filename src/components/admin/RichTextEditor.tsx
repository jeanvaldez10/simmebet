"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  // placeholder = "Add resolution evidence...",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300",
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2 dark:prose-invert text-gray-900 dark:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:text-gray-900 dark:prose-li:text-gray-100",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
      <style jsx global>{`
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .ProseMirror li {
          display: list-item !important;
        }
      `}</style>
      <div className="border-b border-gray-300 dark:border-gray-600 p-2 flex gap-2 flex-wrap bg-gray-50 dark:bg-gray-700">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${
            editor.isActive("bold") 
              ? "bg-gray-200 dark:bg-gray-600" 
              : "hover:bg-gray-100 dark:hover:bg-gray-600"
          } text-gray-900 dark:text-gray-100`}
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${
            editor.isActive("italic") 
              ? "bg-gray-200 dark:bg-gray-600" 
              : "hover:bg-gray-100 dark:hover:bg-gray-600"
          } text-gray-900 dark:text-gray-100`}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${
            editor.isActive("bulletList") 
              ? "bg-gray-200 dark:bg-gray-600" 
              : "hover:bg-gray-100 dark:hover:bg-gray-600"
          } text-gray-900 dark:text-gray-100`}
        >
          • List
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addLink}
          className={`${
            editor.isActive("link") 
              ? "bg-gray-200 dark:bg-gray-600" 
              : "hover:bg-gray-100 dark:hover:bg-gray-600"
          } text-gray-900 dark:text-gray-100`}
        >
          🔗 Link
        </Button>
        {editor.isActive("link") && (
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            onClick={removeLink}
            className="hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
          >
            ❌ Remove Link
          </Button>
        )}
      </div>
      <EditorContent editor={editor} className="min-h-[150px]" />
    </div>
  );
};

