"use client";

import * as React from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  className?: string;
}

const QUICK_PROMPTS = [
  "Is this still available?",
  "Can we meet at the campus library?",
  "What is your best price?",
];

export function MessageInput({
  onSendMessage,
  isSending,
  disabled = false,
  className,
}: MessageInputProps) {
  const [content, setContent] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    await onSendMessage(trimmed);
    setContent("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto expand
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleQuickPromptClick = (prompt: string) => {
    setContent(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div
      className={cn(
        "p-3 sm:p-4 bg-white border-t border-charcoal-200/80 space-y-2.5 shrink-0",
        className
      )}
    >
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-brand-500" />
          Quick:
        </span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled || isSending}
            onClick={() => handleQuickPromptClick(prompt)}
            className="text-[11px] font-medium text-charcoal-600 bg-charcoal-50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-charcoal-200/70 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 touch-manipulation"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field & Submit */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder="Type a message... (Press Enter to send)"
            className="w-full px-4 py-2.5 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs sm:text-sm text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400 resize-none max-h-32 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isSending || disabled}
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
