import { useRef, useState, useEffect } from 'react';
import { Sparkles, Quote, FileQuestion } from 'lucide-react';
import ChatInput from '../ChatInput';
import { historySessions } from '../../data/mockData';

const actionCards = [
  {
    id: '1',
    title: 'Find Patterns',
    description: 'Identify recurring themes across transcripts',
    icon: Sparkles,
  },
  {
    id: '2',
    title: 'Surface Quotes',
    description: 'Pull relevant quotes for specific topics',
    icon: Quote,
  },
  {
    id: '3',
    title: 'Interview Guide',
    description: 'Generate a discovery guide for your research',
    icon: FileQuestion,
  },
];

type CardLayout = 'full' | 'compact' | 'mini';

export default function ChatTab({ currentSessionId }: { currentSessionId?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CardLayout>('full');
  const [inputValue, setInputValue] = useState('');

  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case 'Find Patterns':
        setInputValue('Help me identify recurring themes and patterns across all transcripts regarding...');
        break;
      case 'Surface Quotes':
        setInputValue('Can you pull the most relevant quotes regarding...');
        break;
      case 'Interview Guide':
        setInputValue('Please generate a 10-question discovery interview guide targeting...');
        break;
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width >= 540) {
        setLayout('full');
      } else if (width >= 380) {
        setLayout('compact');
      } else {
        setLayout('mini');
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [currentSessionId]);

  const currentSession = currentSessionId ? historySessions.find(s => s.id === currentSessionId) : null;
  const messages = currentSession?.messages || [];

  return (
    <div className="flex flex-1 flex-col">
      {/* Main content area */}
      <div
        ref={containerRef}
        className={`flex flex-1 flex-col px-6 overflow-y-auto ${messages.length > 0 ? 'items-center py-6' : 'items-center justify-center'}`}
      >
        {messages.length > 0 ? (
          <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pb-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-1 shrink-0">
                    <Sparkles size={14} className="text-primary-600" />
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-sm' 
                    : 'bg-surface border border-border text-text-primary rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <h1
              className={`mb-8 font-semibold text-text-primary ${
                layout === 'mini' ? 'text-lg' : 'text-2xl'
              }`}
            >
              What would you like to discover?
            </h1>

            {/* Action cards — responsive layout */}
            {layout === 'full' && (
              <div className="grid w-full max-w-2xl grid-cols-3 gap-4">
                {actionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.title)}
                      className="group flex flex-col items-start rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-primary-300 hover:shadow-md cursor-pointer"
                    >
                      <Icon size={18} className="mb-2 text-primary-600" />
                      <h3 className="mb-1 text-sm font-semibold text-primary-600">
                        {card.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-text-secondary">
                        {card.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {layout === 'compact' && (
              <div className="flex w-full max-w-md flex-col gap-2">
                {actionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.title)}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-all hover:border-primary-300 hover:shadow-md cursor-pointer"
                    >
                      <Icon size={18} className="shrink-0 text-primary-600" />
                      <h3 className="text-sm font-semibold text-primary-600">
                        {card.title}
                      </h3>
                      <p className="text-xs text-text-tertiary truncate flex-1">
                        {card.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {layout === 'mini' && (
              <div className="flex w-full max-w-xs flex-col gap-1.5">
                {actionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.title)}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-all hover:border-primary-300 hover:shadow-sm cursor-pointer"
                    >
                      <Icon size={16} className="shrink-0 text-primary-600" />
                      <h3 className="text-sm font-semibold text-primary-600">
                        {card.title}
                      </h3>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput 
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => {
          if (!inputValue.trim()) return;
          // In a real app we would send the message here
          setInputValue('');
        }}
      />
    </div>
  );
}
