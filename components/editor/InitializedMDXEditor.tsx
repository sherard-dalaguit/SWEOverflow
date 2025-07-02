"use client";

import {
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  codeBlockPlugin,
  codeMirrorPlugin,
  ConditionalContents,
  CreateLink,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { basicDark } from "cm6-theme-basic-dark";
import { useTheme } from "next-themes";
import type { ForwardedRef } from "react";
import "./dark-editor.css";

type InitializedEditorProps = {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  fieldChange: (value: string) => void;
} & MDXEditorProps;

const codeBlockLanguages = {
  txt: "Plain Text",
  js: "JavaScript",
  ts: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  py: "Python",
  java: "Java",
  html: "HTML",
  css: "CSS",
  scss: "Sass/SCSS",
  json: "JSON",
  sql: "SQL",
  md: "Markdown",
  php: "PHP",
  cpp: "C++",
  c: "C",
  cs: "C#",
  go: "Go",
  rb: "Ruby",
  swift: "Swift",
  rs: "Rust",
  kt: "Kotlin",
  dart: "Dart",
  bash: "Bash",
  sh: "Shell",
  yaml: "YAML",
  xml: "XML",
  dockerfile: "Dockerfile",
};

export default function InitializedMDXEditor({
  editorRef,
  fieldChange,
  ...props
}: InitializedEditorProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? basicDark : [];

  return (
    <MDXEditor
      key={resolvedTheme}
      ref={editorRef}
      className="grid border light-border-2 w-full background-light800_dark200 markdown-editor dark-editor"
      onChange={fieldChange}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
        codeMirrorPlugin({
          codeBlockLanguages,
          autoLoadLanguageSupport: true,
          codeMirrorExtensions: [theme],
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === "codeblock",
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <Separator />

                      <BoldItalicUnderlineToggles />
                      <Separator />

                      <ListsToggle />
                      <Separator />

                      <CreateLink />
                      <InsertImage />
                      <Separator />

                      <InsertTable />
                      <InsertThematicBreak />

                      <InsertCodeBlock />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
      ]}
      {...props}
    />
  );
}