import { ArrowRight } from 'lucide-react';
import { sourceFiles } from '../data/mockData';

interface ChatInputProps {
  value?: string;
  onChange?: (val: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export default function ChatInput({ value, onChange, onSubmit }: ChatInputProps) {
  return (
    <div className="sticky bottom-0 border-t border-border-light bg-surface px-6 py-4">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) onSubmit(e);
        }}
        className="mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 shadow-sm transition-shadow focus-within:border-primary-300 focus-within:shadow-md"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Ask us anything about your research"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        <span className="shrink-0 text-xs text-text-tertiary">
          {sourceFiles.length} sources
        </span>
        <button 
          type="submit"
          disabled={!value?.trim()}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            value?.trim() ? 'bg-primary-600 text-white hover:bg-primary-700 cursor-pointer' : 'bg-surface-tertiary text-text-tertiary cursor-default'
          }`}
        >
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
