import { useState, useEffect } from 'react';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import TabBar, { type TabId } from './components/TabBar';
import ChatTab from './components/tabs/ChatTab';
import HistoryTab from './components/tabs/HistoryTab';
import InsightsTab from './components/tabs/InsightsTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import ArtifactsTab from './components/tabs/ArtifactsTab';
import { ActivityProvider } from './context/ActivityContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  
  // Sidebar state
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Auto-collapse on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 850) {
        setLeftOpen(false);
        setRightOpen(false);
      } else if (width < 1100) {
        setLeftOpen(true);
        setRightOpen(false);
      } else {
        setLeftOpen(true);
        setRightOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleSelectSession = (id: string | null) => {
    setCurrentSessionId(id);
    setActiveTab('chat');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'chat': return <ChatTab currentSessionId={currentSessionId} />;
      case 'history': return <HistoryTab currentSessionId={currentSessionId} onSelectSession={handleSelectSession} />;
      case 'insights': return <InsightsTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'artifacts': return <ArtifactsTab />;
    }
  };

  return (
    <ActivityProvider>
      <div className="flex h-screen overflow-hidden bg-surface-secondary">
        {/* Left Sidebar */}
        <LeftSidebar 
          isOpen={leftOpen} 
          onPanelOpen={() => setLeftOpen(true)} 
        />

        {/* Center Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <TabBar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            leftOpen={leftOpen}
            rightOpen={rightOpen}
            onToggleLeft={() => setLeftOpen(!leftOpen)}
            onToggleRight={() => setRightOpen(!rightOpen)}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            {renderTab()}
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar isOpen={rightOpen} />
      </div>
    </ActivityProvider>
  );
}
