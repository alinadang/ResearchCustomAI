import { historySessions } from '../../data/mockData';
import { Plus } from 'lucide-react';

export default function HistoryTab({ 
  currentSessionId, 
  onSelectSession 
}: { 
  currentSessionId?: string | null; 
  onSelectSession?: (id: string | null) => void; 
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6 border-b border-border-light">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
            Past Research Sessions
          </h2>
          <button 
            onClick={() => onSelectSession?.(null)}
            className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-100"
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {historySessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession?.(session.id)}
                className={`group rounded-xl border p-5 transition-all cursor-pointer ${
                  isCurrent 
                    ? 'border-primary-400 bg-primary-50/30 shadow-sm ring-1 ring-primary-400/20' 
                    : 'border-border bg-surface hover:border-primary-200 hover:shadow-sm'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${isCurrent ? 'text-primary-700' : 'text-text-primary'}`}>
                      {session.title}
                    </h3>
                    {isCurrent && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-text-tertiary">
                    {session.date}
                  </span>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-text-secondary">
                  {session.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {session.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-surface-tertiary px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
