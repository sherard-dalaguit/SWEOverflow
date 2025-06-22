'use client'

import type { ForwardedRef } from 'react'
import {
	headingsPlugin,
	listsPlugin,
	quotePlugin,
	thematicBreakPlugin,
	markdownShortcutPlugin,
	MDXEditor,
	type MDXEditorMethods,
	ChangeCodeMirrorLanguage,
	ConditionalContents,
	toolbarPlugin,
	UndoRedo,
	Separator,
	BoldItalicUnderlineToggles,
	ListsToggle,
	CreateLink,
	InsertImage,
	InsertThematicBreak,
	InsertTable,
	InsertCodeBlock,
	linkDialogPlugin,
	linkPlugin, tablePlugin, imagePlugin, codeBlockPlugin, codeMirrorPlugin, diffSourcePlugin,
} from '@mdxeditor/editor'
import { basicDark } from 'cm6-theme-basic-dark';
import "@mdxeditor/editor/style.css";
import './dark-editor.css'
import {useTheme} from "next-themes";

interface Props {
	value: string;
	fieldChange: (value: string) => void;
	editorRef: ForwardedRef<MDXEditorMethods> | null;
}

const Editor = ({
  value,
	fieldChange,
  editorRef,
  ...props
}: Props) => {
	const { resolvedTheme } = useTheme();
	const theme = resolvedTheme === 'dark' ? [basicDark] : [];

	return (
		<MDXEditor
			key={resolvedTheme}
			markdown={value}
			ref={editorRef}
			className="background-light800_dark200 light-border-2 markdown-editor dark-editor grid w-full border"
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
				codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
				codeMirrorPlugin({
					codeBlockLanguages: {
						css: 'css',
						txt: 'txt',
						sql: 'sql',
						html: 'html',
						saas: 'sass',
						scss: 'scss',
						bash: 'bash',
						json: 'json',
						js: 'javascript',
						ts: 'typescript',
						jsx: 'jsx',
						tsx: 'tsx',
						"": 'unspecified',
					},
					autoLoadLanguageSupport: true,
					codeMirrorExtensions: theme,
				}),
				diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
				toolbarPlugin({
					toolbarContents: () => (
						<ConditionalContents
							options={[
								{
								when: (editor) => editor?.editorType === 'codeblock',
								contents: () => <ChangeCodeMirrorLanguage />
								},
								{
									fallback: () => (
										<>
											<UndoRedo/>
											<Separator/>

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
									)
								}
							]}
						/>
					)
				})
      ]}
      {...props}
    />
	)
};

export default Editor;