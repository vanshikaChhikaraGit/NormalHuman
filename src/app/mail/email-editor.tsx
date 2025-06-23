import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Link } from "@tiptap/extension-link";
import { Text } from "@tiptap/extension-text";
import { StarterKit } from "@tiptap/starter-kit";
import EditorMenubar from "./editor-menubar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TagInput from "./toggle-input";
import { Input } from "@/components/ui/input";
import AIComposeButton from "./ai-compose-button";
import { generate } from "./action";
import { readStreamableValue } from "ai/rsc";

type props = {
  subject: string;
  setSubject: (value: string) => void;

  toValues: { label: string; value: string }[];
  setToValues: (value: { label: string; value: string }[]) => void;

  ccValues: { label: string; value: string }[];
  setCcValues: (value: { label: string; value: string }[]) => void;

  to: string[];

  handleSend: (value: string) => void;
  isSending: boolean;

  defaultToolbarExpanded?: boolean;
};



const EmailEditor = ({
  subject,
  setCcValues,
  setSubject,
  setToValues,
  ccValues,
  to,
  toValues,
  handleSend,
  isSending,
  defaultToolbarExpanded,
}: props) => {


  const [value, setValue] = React.useState<string>("");
  const [token, setToken] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState<boolean>(
    defaultToolbarExpanded ?? false,
  );


  const cmdAiGenerate = async (input:string) => {
    console.log("ai");
    console.log("imput:",input)
    const { output } = await generate(input);

    for await (const x of readStreamableValue(output)) {
      if (x) {
       setToken(x)
      }
    }
  };

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-i": () => {
          console.log("hello");
          cmdAiGenerate(this.editor?.getText());
          return true;
        },
        "Control-i": () => {
          console.log("hello");
          cmdAiGenerate(this.editor?.getText());
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6], // Explicitly enable all heading levels
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: false, // Important to prevent automatic link creation
        HTMLAttributes: {
          class: "text-blue-500 underline",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      CustomText,
    ],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

   React.useEffect(() => {
    editor?.commands.insertContent(token);
  }, [token, editor]);

  if (!editor) return null;

  const onGenerate = (token: string) => {
    console.log(token);
    editor?.commands.insertContent(token);
  };

  return (
    <div className="h-full">
      <div className="flex border-b p-4 py-2">
        <EditorMenubar editor={editor} />
      </div>

      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              label="To"
              onChange={setToValues}
              placeholder="Add Recipients"
              value={toValues}
            ></TagInput>

            <TagInput
              label="Cc"
              onChange={setCcValues}
              placeholder="Add Recipients"
              value={ccValues}
            ></TagInput>

            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            ></Input>
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-md font-medium text-green-600">Draft </span>
            <span className="text-sm">to {to.join(",")}</span>
          </div>
          <AIComposeButton
            isComposing={false}
            onGenerate={onGenerate}
          ></AIComposeButton>
        </div>
      </div>

      <div className="prose w-full max-w-none px-4">
        <EditorContent editor={editor} />
      </div>

      <Separator></Separator>

      <div className="flex items-center justify-between px-4 py-1">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd/Ctrl + I
          </kbd>
          for AI autocomplete.
        </span>
        <Button
          onClick={() => {
            editor?.commands?.clearContent();
            handleSend(value);
          }}
          disabled={isSending}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
