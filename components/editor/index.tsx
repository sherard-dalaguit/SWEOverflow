"use client";

import { type MDXEditorMethods, type MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";

type EditorProps = {
  value: string;
  fieldChange: (value: string) => void;
} & Omit<MDXEditorProps, "markdown" | "onChange">;

const InitializedEditor = dynamic(() => import("./InitializedMDXEditor"), {
  // Make sure we turn SSR off
  ssr: false,
});

const Editor = forwardRef<MDXEditorMethods, EditorProps>(
  ({ value, fieldChange, ...props }, ref) => (
    <InitializedEditor
      {...props}
      markdown={value}
      fieldChange={fieldChange}
      editorRef={ref}
    />
  )
);

Editor.displayName = "Editor";

export default Editor;