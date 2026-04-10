import { useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowRight, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ChatInputProps {
  value?: string;
  onChange?: (val: string) => void;
  /** Called when the user submits a non-empty message */
  onSubmit?: (e: React.FormEvent) => void;
  /** Disables the input entirely (e.g. while initialising) */
  disabled?: boolean;
  /** True while waiting for a backend response */
  isLoading?: boolean;
  /** Called when the user clicks the Stop button during a request */
  onStop?: () => void;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  onStop,
}: ChatInputProps) {
  const { sourceFiles } = useAppContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to ~5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!value?.trim() || disabled || isLoading) return;
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      onSubmit?.(syntheticEvent);
    }
  };

  const isBlocked = disabled || isLoading;
  const canSend = !!value?.trim() && !isBlocked;

  return (
    <div className="sticky bottom-0 border-t border-border-light bg-surface px-6 py-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading) {
            onStop?.();
            return;
          }
          if (canSend) onSubmit?.(e);
        }}
        className={`mx-auto flex max-w-2xl items-end gap-3 rounded-2xl border bg-surface px-4 py-3 shadow-sm transition-shadow ${
          isBlocked
            ? 'border-border opacity-70'
            : 'border-border focus-within:border-primary-300 focus-within:shadow-md'
        }`}
      >
        {/* Textarea — grows with content, Shift+Enter for newlines */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? 'Waiting for response…' : 'Ask anything about your research'}
          disabled={isBlocked}
          className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none leading-relaxed disabled:cursor-not-allowed"
          style={{ maxHeight: '120px' }}
        />

        {/* Source badge */}
        <span className="mb-0.5 shrink-0 text-xs text-text-tertiary self-end pb-0.5">
          {sourceFiles.length} source{sourceFiles.length !== 1 ? 's' : ''}
        </span>

        {/* Send / Stop button */}
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            title="Stop generating"
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 cursor-pointer self-end"
          >
            <Square size={12} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            title={canSend ? 'Send (Enter)' : undefined}
            className={`mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors self-end ${
              canSend
                ? 'bg-primary-600 text-white hover:bg-primary-700 cursor-pointer'
                : 'bg-surface-tertiary text-text-tertiary cursor-default'
            }`}
          >
            <ArrowRight size={16} />
          </button>
        )}
      </form>

      {/* Hint */}
      {!isBlocked && (
        <p className="mt-2 text-center text-[10px] text-text-tertiary">
          Enter to send · Shift+Enter for new line
        </p>
      )}
    </div>
  );
}
