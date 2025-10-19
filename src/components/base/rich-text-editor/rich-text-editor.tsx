"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { useState, useEffect } from "react";
import { cx } from "@/utils/cx";

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	maxLength?: number;
}

export const RichTextEditor = ({
	value,
	onChange,
	placeholder = "Write something...",
	className,
	maxLength = 1000,
}: RichTextEditorProps) => {
	const [currentColor, setCurrentColor] = useState("#181d27");

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: false,
				code: false,
				codeBlock: false,
				horizontalRule: false,
				blockquote: false,
			}),
			TextAlign.configure({
				types: ["paragraph"],
			}),
			Color,
		],
		content: value,
		editorProps: {
			attributes: {
				class: "prose prose-sm focus:outline-none max-w-none p-4 text-md text-primary",
			},
		},
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange(html);
		},
	});

	// Update editor content when value changes externally
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	if (!editor) {
		return null;
	}

	const characterCount = editor.storage.characterCount?.characters() || editor.getText().length;
	const remainingChars = maxLength - characterCount;

	return (
		<div className={cx("flex flex-col gap-2", className)}>
			{/* Toolbar */}
			<div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-sm">
				{/* Bold */}
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={cx(
						"flex size-8 items-center justify-center rounded-md transition-colors hover:bg-primary_hover",
						editor.isActive("bold") && "bg-secondary_bg"
					)}
					title="Bold"
				>
					<svg className="size-5 text-tertiary" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
						<path d="M5 4h6a3 3 0 013 3v0a3 3 0 01-3 3H5V4zM5 10h7a3 3 0 013 3v0a3 3 0 01-3 3H5v-6z" />
					</svg>
				</button>

				{/* Italic */}
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={cx(
						"flex size-8 items-center justify-center rounded-md transition-colors hover:bg-primary_hover",
						editor.isActive("italic") && "bg-secondary_bg"
					)}
					title="Italic"
				>
					<svg className="size-5 text-tertiary" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
						<path d="M8 16h4M10 4l-2 12" />
					</svg>
				</button>

				{/* Underline - Using strike as alternative since underline requires extension */}
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={cx(
						"flex size-8 items-center justify-center rounded-md transition-colors hover:bg-primary_hover",
						editor.isActive("strike") && "bg-secondary_bg"
					)}
					title="Strikethrough"
				>
					<svg className="size-5 text-tertiary" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
						<path d="M4 10h12M7 4h6a3 3 0 010 6H7m0 6h6a3 3 0 100-6" />
					</svg>
				</button>

				{/* Divider */}
				<div className="mx-1 h-6 w-px bg-border" />

				{/* Color Picker */}
				<div className="relative">
					<label className="flex size-8 cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors hover:bg-primary_hover" title="Text Color">
						<div
							className="size-4 rounded-full border border-border"
							style={{ backgroundColor: currentColor }}
						/>
						<input
							type="color"
							value={currentColor}
							onChange={(e) => {
								setCurrentColor(e.target.value);
								editor.chain().focus().setColor(e.target.value).run();
							}}
							className="absolute inset-0 size-full cursor-pointer opacity-0"
						/>
					</label>
				</div>

				{/* Divider */}
				<div className="mx-1 h-6 w-px bg-border" />

				{/* Align Left */}
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={cx(
						"flex size-8 items-center justify-center rounded-md transition-colors hover:bg-primary_hover",
						editor.isActive({ textAlign: "left" }) && "bg-secondary_bg"
					)}
					title="Align Left"
				>
					<svg className="size-5 text-tertiary" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
						<path d="M3 5h14M3 10h10M3 15h14" />
					</svg>
				</button>

				{/* Align Center */}
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={cx(
						"flex size-8 items-center justify-center rounded-md transition-colors hover:bg-primary_hover",
						editor.isActive({ textAlign: "center" }) && "bg-secondary_bg"
					)}
					title="Align Center"
				>
					<svg className="size-5 text-tertiary" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
						<path d="M3 5h14M5 10h10M3 15h14" />
					</svg>
				</button>

				{/* Bullet List */}
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={cx(
						"flex size-8 items-center justify-center rounded-md transition-colors hover:bg-primary_hover",
						editor.isActive("bulletList") && "bg-secondary_bg"
					)}
					title="Bullet List"
				>
					<svg className="size-5 text-tertiary" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
						<circle cx="5" cy="6" r="1" fill="currentColor" />
						<circle cx="5" cy="10" r="1" fill="currentColor" />
						<circle cx="5" cy="14" r="1" fill="currentColor" />
						<path d="M8 6h8M8 10h8M8 14h8" />
					</svg>
				</button>
			</div>

			{/* Editor Content */}
			<div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
				<EditorContent editor={editor} />
			</div>

			{/* Character Counter */}
			<p className="text-sm text-tertiary">
				{remainingChars} characters left
			</p>
		</div>
	);
};

