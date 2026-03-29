import { BarChart3 } from 'lucide-react';

export default function AnalyticsTab() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-tertiary">
          <BarChart3 size={28} className="text-text-tertiary" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-text-primary">Analytics Coming Soon</h2>
        <p className="max-w-sm text-sm text-text-secondary">
          Visualize research trends, track theme frequency, and monitor your
          discovery progress — all in one place.
        </p>
      </div>
    </div>
  );
}
