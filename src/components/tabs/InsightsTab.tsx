import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { insightCategories, insightQuotes } from '../../data/mockData';
import ChatInput from '../ChatInput';

export default function InsightsTab() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredQuotes = activeCategory
    ? insightQuotes.filter((q) => q.category === activeCategory)
    : insightQuotes;

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
            Saved Interview Highlights
          </h2>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700">
            <Sparkles size={14} />
            Surface Quotes
          </button>
        </div>

        {/* Category filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {insightCategories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setActiveCategory(activeCategory === category ? null : category)
              }
              className={`rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-colors ${
                activeCategory === category
                  ? 'border-primary-300 bg-primary-50 text-primary-600'
                  : 'border-border bg-surface text-text-secondary hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              {category}
            </button>
          ))}
          <button className="flex items-center gap-1 rounded-md border border-dashed border-border px-3 py-1.5 text-[11px] font-medium text-text-tertiary transition-colors hover:border-primary-300 hover:text-primary-600">
            <Plus size={12} />
            Add Category
          </button>
        </div>

        {/* Insight cards */}
        <div className="flex flex-col gap-4">
          {filteredQuotes.map((insight) => (
            <div
              key={insight.id}
              className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary-200 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3
                  className="text-[11px] font-bold tracking-wider uppercase"
                  style={{ color: insight.categoryColor }}
                >
                  {insight.category}
                </h3>
                <span className="text-[10px] text-text-tertiary">
                  {insight.sourceFile} · line {insight.lineNumber}
                </span>
              </div>
              <blockquote className="mb-3 text-sm leading-relaxed text-text-primary italic">
                {insight.quote}
              </blockquote>
              <p className="text-xs text-text-secondary">
                {insight.interviewee} · {insight.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ChatInput />
    </div>
  );
}
