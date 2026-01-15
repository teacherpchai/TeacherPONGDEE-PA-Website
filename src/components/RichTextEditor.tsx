"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Link as LinkIcon,
    Palette,
    Type,
    Undo,
    Redo,
} from "lucide-react";
import { useEffect, useCallback } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

// Font size options
const FONT_SIZES = [
    { label: "เล็ก", value: "0.875rem" },
    { label: "ปกติ", value: "1rem" },
    { label: "ใหญ่", value: "1.125rem" },
    { label: "ใหญ่มาก", value: "1.25rem" },
];

// Color options
const TEXT_COLORS = [
    { label: "ดำ", value: "#000000" },
    { label: "น้ำเงิน", value: "#002366" },
    { label: "ทอง", value: "#D4AF37" },
    { label: "แดง", value: "#DC2626" },
    { label: "เขียว", value: "#059669" },
    { label: "ม่วง", value: "#7C3AED" },
    { label: "ส้ม", value: "#EA580C" },
    { label: "เทา", value: "#6B7280" },
];

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "พิมพ์ข้อความ...",
    className = "",
    minHeight = "150px",
}: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                blockquote: false,
            }),
            Underline,
            TextStyle,
            Color,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline hover:text-blue-800",
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: `prose prose-sm max-w-none focus:outline-none p-3`,
                style: `min-height: ${minHeight}`,
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Return empty string if only empty paragraph
            if (html === "<p></p>") {
                onChange("");
            } else {
                onChange(html);
            }
        },
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML() && value !== "<p></p>") {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL:", previousUrl);

        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return (
            <div
                className={`border rounded-lg bg-gray-50 animate-pulse ${className}`}
                style={{ minHeight }}
            />
        );
    }

    return (
        <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
                {/* Text Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="ตัวหนา"
                >
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="ตัวเอียง"
                >
                    <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="ขีดเส้นใต้"
                >
                    <UnderlineIcon size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                    title="ขีดฆ่า"
                >
                    <Strikethrough size={16} />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="รายการ"
                >
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="รายการลำดับ"
                >
                    <ListOrdered size={16} />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Link */}
                <ToolbarButton
                    onClick={setLink}
                    active={editor.isActive("link")}
                    title="ลิงก์"
                >
                    <LinkIcon size={16} />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Color Picker */}
                <div className="relative group">
                    <button
                        type="button"
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 text-gray-700"
                        title="สีตัวอักษร"
                    >
                        <Palette size={16} />
                        <span className="text-xs">▼</span>
                    </button>
                    <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 hidden group-hover:grid grid-cols-4 gap-1 z-10 min-w-[140px]">
                        {TEXT_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => editor.chain().focus().setColor(color.value).run()}
                                className="w-7 h-7 rounded border border-gray-200 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div className="relative group">
                    <button
                        type="button"
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 text-gray-700"
                        title="ขนาดตัวอักษร"
                    >
                        <Type size={16} />
                        <span className="text-xs">▼</span>
                    </button>
                    <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 hidden group-hover:block z-10 min-w-[100px]">
                        {FONT_SIZES.map((size) => (
                            <button
                                key={size.value}
                                type="button"
                                onClick={() => {
                                    // Apply font size using style
                                    editor.chain().focus().run();
                                    document.execCommand("fontSize", false, "7");
                                    // Note: For better font-size support, consider @tiptap/extension-font-size
                                }}
                                className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                                style={{ fontSize: size.value }}
                            >
                                {size.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1" />

                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="เลิกทำ"
                >
                    <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="ทำซ้ำ"
                >
                    <Redo size={16} />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="focus-within:ring-2 focus-within:ring-blue-200"
            />

            {/* Placeholder */}
            {editor.isEmpty && (
                <div
                    className="absolute top-[52px] left-3 text-gray-400 pointer-events-none"
                    style={{ display: editor.isFocused ? "none" : "block" }}
                >
                    {placeholder}
                </div>
            )}
        </div>
    );
}

// Toolbar Button Component
function ToolbarButton({
    onClick,
    active = false,
    disabled = false,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded transition-colors ${active
                ? "bg-blue-100 text-blue-700"
                : disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
        >
            {children}
        </button>
    );
}
