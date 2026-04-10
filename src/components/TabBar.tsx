import {
  MessageSquare,
  Clock,
  Lightbulb,
  BarChart3,
  FileOutput,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

export type TabId = 'chat' | 'history' | 'insights' | 'analytics' | 'artifacts';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  leftOpen?: boolean;
  rightOpen?: boolean;
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'artifacts', label: 'Artifacts', icon: FileOutput },
];

export default function TabBar({ 
  activeTab, 
  onTabChange, 
  leftOpen = true, 
  rightOpen = true, 
  onToggleLeft, 
  onToggleRight 
}: TabBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-1">
      {/* Left Toggle */}
      <button 
        onClick={onToggleLeft}
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
        title={leftOpen ? "Close sidebar" : "Open sidebar"}
      >
        {leftOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      {/* Center Tabs */}
      <nav className="flex items-center justify-center -mb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-600" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Toggle */}
      <button 
        onClick={onToggleRight}
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
        title={rightOpen ? "Close tracker" : "Open tracker"}
      >
        {rightOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
      </button>
    </div>
  );
}
