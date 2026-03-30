import { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { type Artifact } from '../../data/mockData';
import ChatInput from '../ChatInput';
import ArtifactPreviewModal from '../ArtifactPreviewModal';
import { useAppContext } from '../../context/AppContext';

const badgeColors: Record<string, { bg: string; text: string }> = {
  PDF: { bg: '#fef2f2', text: '#ef4444' },
  RPT: { bg: '#f5f3ff', text: '#8b5cf6' },
  DOC: { bg: '#eff6ff', text: '#3b82f6' },
  CSV: { bg: '#ecfdf5', text: '#10b981' },
};

export default function ArtifactsTab() {
  const { artifacts } = useAppContext();
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 className="mb-5 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
          Generated Artifacts
        </h2>

        <div className="flex flex-col gap-4">
          {artifacts.map((artifact) => {
            const colors = badgeColors[artifact.type] || badgeColors.DOC;
            return (
              <div
                key={artifact.id}
                onClick={() => setSelectedArtifact(artifact)}
                className="flex items-center gap-4 cursor-pointer rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary-200 hover:shadow-sm"
              >
                {/* Type badge */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {artifact.type}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {artifact.title}
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    {artifact.generatedDate} · {artifact.metadata}
                  </p>
                </div>

                {/* Action button */}
                <button
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    artifact.action === 'Download'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'border border-primary-200 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {artifact.action === 'Download' ? (
                    <Download size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                  {artifact.action}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <ChatInput />

      {selectedArtifact && (
        <ArtifactPreviewModal 
          artifact={selectedArtifact} 
          onClose={() => setSelectedArtifact(null)} 
        />
      )}
    </div>
  );
}
