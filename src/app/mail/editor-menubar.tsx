import { LinkButton } from "@/components/kbar/link-button";
import { Button } from "@/components/ui/button";
import type { Editor } from "@tiptap/react";
import {
  Bold, Code, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Italic, List, ListOrdered, Quote, Redo, Strikethrough, Undo
} from "lucide-react";

const EditorMenubar = ({ editor }: { editor: Editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap border rounded-t-lg">
      {/* Text formatting buttons */}
      <Button
        className="cursor-pointer"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold  />
      </Button>

      <Button
      className="cursor-pointer"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic/>
      </Button>

      <Button
      className="cursor-pointer"
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <Strikethrough/>
      </Button>

      <Button
      className="cursor-pointer"
        variant={editor.isActive('code') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
      >
        <Code/>
      </Button>
      
      {/* //link  */}
<LinkButton editor={editor}></LinkButton>
      

      {/* Lists */}
      <Button
      className="cursor-pointer"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List/>
      </Button>

      <Button
      className="cursor-pointer"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered/>
      </Button>

      {/* Blockquote */}
      <Button
      className="cursor-pointer"
        variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote/>
      </Button>

      {/* Undo/Redo */}
      <Button
      className="cursor-pointer"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo/>
      </Button>

      <Button
      className="cursor-pointer"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo/>
      </Button>
    </div>
  );
};

export default EditorMenubar;