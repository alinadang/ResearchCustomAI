import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Quote, FileQuestion,
  AlertCircle, RefreshCw,
  Trash2, BookmarkPlus, Download, Printer, ClipboardCopy,
  Check, X,
} from 'lucide-react';
import ChatInput from '../ChatInput';
import { useAppContext } from '../../context/AppContext';
import { type ChatMessage, type HistorySession } from '../../data/mockData';

// ─── Local types ──────────────────────────────────────────────────────────────

/** Extends the base ChatMessage with UI-only fields for the active session. */
interface ActiveMessage extends ChatMessage {
  timestamp: Date;
  /** True if this bubble represents a failed request that can be retried. */
  isError?: boolean;
}

type CardLayout = 'full' | 'compact' | 'mini';

// ─── Demo replies (fallback when backend is unavailable) ─────────────────

const DEMO_REPLIES: string[] = [
  "Based on your uploaded sources, I identified three recurring themes: pricing opacity, network fragmentation, and depot-charging needs for fleet operators. Would you like me to drill into any of these?",
  "Across the interview transcripts I found 7 distinct pain points. The most frequent — mentioned by 4 of 5 participants — was the inability to compare per-kWh costs across charging networks before committing to a session.",
  "The 2025 market analysis report doesn't mention RFID fragmentation at all, but three of your interviewees flagged it independently. That's a meaningful gap worth including in your validation summary.",
  "I can generate a 10-question discovery guide targeting fleet depot operators. Should it focus on cost predictability, charging infrastructure logistics, or both?",
  "Synthesising all five sources: the top unmet need is transparent, upfront pricing. Secondary needs are charger reliability and a unified network account. I've saved these as insights — you can view them in the Insights tab.",
];

// ─── BACKEND INTEGRATION ─────────────────────────────────────────────────
//
// Tries the real FastAPI backend first. If it fails for any reason (server
// down, no API key, network error), falls back to demo replies so the chat
// remains functional during development.
//
// Once you set API_KEY and start the backend, real AI responses appear
// automatically — no code changes needed.
// ─────────────────────────────────────────────────────────────────────────

import { sendMessage as apiSendMessage } from '../../api';

async function callBackend(
  userMessage: string,
  _history: { role: string; content: string }[],
  signal: AbortSignal,
): Promise<string> {
  // Try the real backend first
  try {
    const reply = await apiSendMessage(userMessage, undefined, undefined, signal);
    return reply;
  } catch (err) {
    // If aborted by user, re-throw so the UI handles it properly
    if (err instanceof DOMException && err.name === 'AbortError') throw err;

    // Backend is down or errored — fall back to demo replies
    console.warn('[ChatTab] Backend unavailable, using demo reply:', err);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 800 + Math.random() * 600);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request cancelled', 'AbortError'));
      });
    });
    const demoReply = DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
    return `⚠️ Demo mode — backend not connected.\n\n${demoReply}`;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive a session title from the first user message. */
function deriveTitle(msgs: ActiveMessage[]): string {
  const first = msgs.find((m) => m.role === 'user' && !m.isError);
  if (!first) return 'Untitled Chat';
  const t = first.content.trim();
  return t.length > 58 ? t.slice(0, 55) + '…' : t;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
        <Sparkles size={14} className="text-primary-600" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary-300 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ActiveMessage }) {
  const isUser = message.role === 'user';
  const isError = !!message.isError;
  const timeLabel = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isError ? 'bg-red-100' : 'bg-primary-100'}`}>
            {isError
              ? <AlertCircle size={14} className="text-red-500" />
              : <Sparkles size={14} className="text-primary-600" />}
          </div>
        )}
        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-br-sm'
            : isError
              ? 'border border-red-200 bg-red-50 text-red-700 rounded-bl-sm'
              : 'border border-border bg-surface text-text-primary rounded-bl-sm'
        }`}>
          {message.content}
        </div>
      </div>
      <span className={`text-[10px] text-text-tertiary ${isUser ? 'pr-1' : 'pl-10'}`}>{timeLabel}</span>
    </div>
  );
}

// ─── Action prompt cards ──────────────────────────────────────────────────────

const ACTION_CARDS = [
  { id: '1', title: 'Find Patterns', description: 'Identify recurring themes across transcripts', icon: Sparkles, prompt: 'Help me identify recurring themes and patterns across all transcripts regarding...' },
  { id: '2', title: 'Surface Quotes', description: 'Pull relevant quotes for specific topics', icon: Quote, prompt: 'Can you pull the most relevant quotes regarding...' },
  { id: '3', title: 'Interview Guide', description: 'Generate a discovery guide for your research', icon: FileQuestion, prompt: 'Please generate a 10-question discovery interview guide targeting...' },
];

// ─── ChatTab ─────────────────────────────────────────────────────────────────

export default function ChatTab({ currentSessionId }: { currentSessionId?: string | null }) {
  const { historySessions, setHistorySessions, addActivity } = useAppContext();

  // ── Responsive layout ────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CardLayout>('full');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setLayout(w >= 540 ? 'full' : w >= 380 ? 'compact' : 'mini');
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Message + request state ──────────────────────────────────────────────
  const [messages, setMessages] = useState<ActiveMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Toolbar state ────────────────────────────────────────────────────────
  /** Whether the chat has been saved to history since the last message. */
  const [isSaved, setIsSaved] = useState(false);
  /** When true, the Clear button shows an inline confirm prompt. */
  const [clearPending, setClearPending] = useState(false);
  /** Transient success toast text (auto-clears after 2.5 s). */
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ── Load session messages on change ─────────────────────────────────────
  useEffect(() => {
    if (currentSessionId) {
      const session = historySessions.find((s) => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages.map((m) => ({ ...m, timestamp: new Date() })));
        setIsSaved(true); // already persisted in history
      }
    } else {
      setMessages([]);
      setIsSaved(false);
    }
    setError(null);
    setInputValue('');
    abortRef.current?.abort();
    setIsLoading(false);
    setClearPending(false);
  }, [currentSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Auto-dismiss clear-confirm after 4 s ────────────────────────────────
  useEffect(() => {
    if (!clearPending) return;
    const t = setTimeout(() => setClearPending(false), 4000);
    return () => clearTimeout(t);
  }, [clearPending]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // ── Core send / receive flow ─────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ActiveMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsLoading(true);
      setError(null);
      setIsSaved(false); // new message → unsaved

      const ac = new AbortController();
      abortRef.current = ac;
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      try {
        const reply = await callBackend(text.trim(), history, ac.signal);
        const assistantMsg: ActiveMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        addActivity('AI responded to your query', 'AI response', '#818cf8');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User cancelled — no error displayed
        } else {
          const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
          setError(msg);
          setMessages((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, role: 'assistant', content: msg, timestamp: new Date(), isError: true },
          ]);
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, messages, addActivity]
  );

  const handleStop = () => abortRef.current?.abort();

  const handleRetry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user' && !m.isError);
    setMessages((prev) => prev.filter((m) => !m.isError));
    setError(null);
    if (lastUser) sendMessage(lastUser.content);
  };

  // ── Toolbar actions ──────────────────────────────────────────────────────

  /** Step 1 — arm the confirm state; step 2 — actually clear. */
  const handleClearClick = () => {
    if (!clearPending) { setClearPending(true); return; }
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsSaved(false);
    setClearPending(false);
  };

  /** Save current messages as a new HistorySession. */
  const handleSave = () => {
    const clean = messages.filter((m) => !m.isError);
    if (!clean.length) return;

    const userCount = clean.filter((m) => m.role === 'user').length;
    const aiCount = clean.filter((m) => m.role === 'assistant').length;

    const newSession: HistorySession = {
      id: `session-${Date.now()}`,
      title: deriveTitle(messages),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: clean
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .slice(0, 2)
        .join(' · ')
        .slice(0, 130),
      tags: [`${userCount} message${userCount !== 1 ? 's' : ''}`, `${aiCount} AI response${aiCount !== 1 ? 's' : ''}`],
      messages: clean.map(({ id, role, content }) => ({ id, role, content })),
    };

    setHistorySessions((prev) => [newSession, ...prev]);
    addActivity('Chat saved to history', 'saved to history', '#22c55e');
    setIsSaved(true);
    showToast('Saved to history');
  };

  /** Download the conversation as a Markdown file. */
  const handleExport = () => {
    const clean = messages.filter((m) => !m.isError);
    if (!clean.length) return;

    const title = deriveTitle(messages);
    const body = clean
      .map((m) => {
        const who = m.role === 'user' ? '**You**' : '**AI Assistant**';
        const time = m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${who} — ${time}\n\n${m.content}`;
      })
      .join('\n\n---\n\n');

    const md = `# ${title}\n\n_Exported ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}_\n\n---\n\n${body}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as Markdown');
  };

  /** Open a clean print-friendly popup with just the conversation. */
  const handlePrint = () => {
    const clean = messages.filter((m) => !m.isError);
    if (!clean.length) return;

    const title = deriveTitle(messages);
    const rows = clean
      .map((m) => {
        const who = m.role === 'user' ? 'You' : 'AI Assistant';
        const time = m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const align = m.role === 'user' ? 'flex-end' : 'flex-start';
        const bg = m.role === 'user' ? '#eef2ff' : '#f8fafc';
        const border = m.role === 'user' ? '#c7d2fe' : '#e2e8f0';
        return `
          <div style="display:flex;flex-direction:column;align-items:${align};margin-bottom:14px;">
            <div style="font-size:10px;color:#94a3b8;margin-bottom:3px;">${who} · ${time}</div>
            <div style="max-width:72%;background:${bg};border:1px solid ${border};border-radius:12px;padding:10px 14px;font-size:13px;line-height:1.6;color:#1e293b;">${m.content.replace(/\n/g, '<br>')}</div>
          </div>`;
      })
      .join('');

    const html = `<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        *{box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:36px auto;padding:0 20px;color:#1e293b}
        h1{font-size:18px;margin-bottom:2px}
        .meta{font-size:11px;color:#94a3b8;margin-bottom:20px}
        hr{border:none;border-top:1px solid #e2e8f0;margin:16px 0 20px}
        @media print{body{margin:16px}}
      </style></head><body>
      <h1>${title}</h1>
      <p class="meta">Printed ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ${clean.length} messages</p>
      <hr>${rows}</body></html>`;

    const w = window.open('', '_blank', 'width=760,height=920,scrollbars=yes');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 250); }
  };

  /** Copy the full conversation to the clipboard as plain text. */
  const handleCopy = async () => {
    const clean = messages.filter((m) => !m.isError);
    if (!clean.length) return;
    const text = clean
      .map((m) => {
        const who = m.role === 'user' ? 'You' : 'AI';
        const time = m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${who} (${time}):\n${m.content}`;
      })
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      showToast('Copy failed — try manually selecting the text');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const hasMessages = messages.length > 0;
  const cleanCount = messages.filter((m) => !m.isError).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-light bg-surface px-5 py-2">
        {/* Left — metadata */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-text-secondary">Chat</span>
          {hasMessages && (
            <>
              <span className="text-text-tertiary text-xs">·</span>
              <span className="text-xs text-text-tertiary">{cleanCount} message{cleanCount !== 1 ? 's' : ''}</span>
              {!isSaved && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Unsaved
                </span>
              )}
              {isSaved && (
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                  <Check size={10} />
                  Saved
                </span>
              )}
            </>
          )}
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-1">
          {/* Toast notification */}
          {toastMsg && (
            <span className="mr-2 flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700 animate-in fade-in duration-200">
              <Check size={11} />
              {toastMsg}
            </span>
          )}

          {/* ── Clear ── */}
          {clearPending ? (
            <div className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1">
              <span className="text-[11px] font-medium text-red-600">Clear all?</span>
              <button
                onClick={handleClearClick}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                <Check size={11} /> Yes
              </button>
              <button
                onClick={() => setClearPending(false)}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary transition-colors hover:bg-surface-tertiary"
              >
                <X size={11} /> No
              </button>
            </div>
          ) : (
            <ToolbarBtn
              icon={<Trash2 size={13} />}
              label="Clear"
              title="Clear chat (will ask for confirmation)"
              disabled={!hasMessages || isLoading}
              danger
              onClick={handleClearClick}
            />
          )}

          <div className="mx-1 h-4 w-px bg-border-light" />

          <ToolbarBtn
            icon={<BookmarkPlus size={13} />}
            label="Save"
            title="Save this conversation to history"
            disabled={!hasMessages || isLoading || isSaved}
            onClick={handleSave}
          />
          <ToolbarBtn
            icon={<Download size={13} />}
            label="Export"
            title="Download as Markdown (.md)"
            disabled={!hasMessages || isLoading}
            onClick={handleExport}
          />
          <ToolbarBtn
            icon={<Printer size={13} />}
            label="Print"
            title="Print conversation"
            disabled={!hasMessages || isLoading}
            onClick={handlePrint}
          />
          <ToolbarBtn
            icon={<ClipboardCopy size={13} />}
            label="Copy"
            title="Copy all messages to clipboard"
            disabled={!hasMessages || isLoading}
            onClick={handleCopy}
          />
        </div>
      </div>

      {/* ── Message area ── */}
      <div
        ref={containerRef}
        className={`flex flex-1 flex-col overflow-y-auto px-6 ${hasMessages ? 'py-6' : 'items-center justify-center'}`}
      >
        {hasMessages ? (
          <div className="flex w-full max-w-3xl mx-auto flex-col gap-5 pb-4">
            {messages.map((m) => <MessageBubble key={m.id} message={m} />)}

            {isLoading && <TypingIndicator />}

            {error && !isLoading && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <p className="flex-1 text-xs text-red-700">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        ) : (
          /* ── Empty / welcome state ── */
          <div className="flex w-full flex-col items-center justify-center">
            <h1 className={`mb-2 font-semibold text-text-primary ${layout === 'mini' ? 'text-lg' : 'text-2xl'}`}>
              What would you like to discover?
            </h1>
            <p className="mb-8 text-sm text-text-secondary">
              Ask a question or choose a prompt below to get started.
            </p>

            {layout === 'full' && (
              <div className="grid w-full max-w-2xl grid-cols-3 gap-4">
                {ACTION_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button key={card.id} onClick={() => setInputValue(card.prompt)}
                      className="group flex flex-col items-start rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-primary-300 hover:shadow-md">
                      <Icon size={18} className="mb-2 text-primary-600" />
                      <h3 className="mb-1 text-sm font-semibold text-primary-600">{card.title}</h3>
                      <p className="text-xs leading-relaxed text-text-secondary">{card.description}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {layout === 'compact' && (
              <div className="flex w-full max-w-md flex-col gap-2">
                {ACTION_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button key={card.id} onClick={() => setInputValue(card.prompt)}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-all hover:border-primary-300 hover:shadow-md">
                      <Icon size={18} className="shrink-0 text-primary-600" />
                      <h3 className="text-sm font-semibold text-primary-600">{card.title}</h3>
                      <p className="flex-1 truncate text-xs text-text-tertiary">{card.description}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {layout === 'mini' && (
              <div className="flex w-full max-w-xs flex-col gap-1.5">
                {ACTION_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button key={card.id} onClick={() => setInputValue(card.prompt)}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-all hover:border-primary-300 hover:shadow-sm">
                      <Icon size={16} className="shrink-0 text-primary-600" />
                      <h3 className="text-sm font-semibold text-primary-600">{card.title}</h3>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        isLoading={isLoading}
        onStop={handleStop}
        onSubmit={() => sendMessage(inputValue)}
      />
    </div>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  icon,
  label,
  title,
  disabled,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  title?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-35 ${
        danger
          ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
          : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
