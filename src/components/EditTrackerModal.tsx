import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { type TrackerPhase, type SubTask } from '../data/mockData';

export default function EditTrackerModal({
  phases,
  onSave,
  onClose,
}: {
  phases: TrackerPhase[];
  onSave: (phases: TrackerPhase[]) => void;
  onClose: () => void;
}) {
  const [draftPhases, setDraftPhases] = useState<TrackerPhase[]>(
    // Deep clone to avoid mutating external state before save
    JSON.parse(JSON.stringify(phases))
  );

  const handleUpdateTaskLabel = (phaseId: string, taskId: string, newLabel: string) => {
    setDraftPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId || !p.subTasks) return p;
        return {
          ...p,
          subTasks: p.subTasks.map((t) => (t.id === taskId ? { ...t, label: newLabel } : t)),
        };
      })
    );
  };

  const handleDeleteTask = (phaseId: string, taskId: string) => {
    setDraftPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId || !p.subTasks) return p;
        const newSubTasks = p.subTasks.filter((t) => t.id !== taskId);
        
        // Update counts
        const completedCount = newSubTasks.filter(t => t.status === 'done').length;
        let newPhaseStatus: TrackerPhase['status'] = p.status;
        if (newSubTasks.length > 0) {
          if (completedCount === newSubTasks.length) newPhaseStatus = 'complete';
          else if (completedCount === 0 && newSubTasks.every(t => t.status === 'todo')) newPhaseStatus = 'not-started';
          else newPhaseStatus = 'in-progress';
        }

        return { 
          ...p, 
          subTasks: newSubTasks, 
          completed: completedCount, 
          total: newSubTasks.length,
          status: newPhaseStatus 
        };
      })
    );
  };

  const handleAddTask = (phaseId: string) => {
    setDraftPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        const newSubTask: SubTask = {
          id: `new-${Date.now()}-${Math.random()}`,
          label: '',
          status: 'todo',
        };
        const newSubTasks = [...(p.subTasks || []), newSubTask];
        
        // Re-evaluate status since a new 'todo' task was added
        let newPhaseStatus: TrackerPhase['status'] = p.status;
        if (p.status === 'complete') newPhaseStatus = 'in-progress'; // No longer complete

        return { 
          ...p, 
          subTasks: newSubTasks, 
          total: newSubTasks.length,
          status: newPhaseStatus
        };
      })
    );
  };

  const handleSave = () => {
    // Filter out completely empty tasks before saving
    const cleanedPhases = draftPhases.map(p => {
      if (!p.subTasks) return p;
      return {
        ...p,
        subTasks: p.subTasks.filter(t => t.label.trim().length > 0),
      };
    }).map(p => {
      // Recalculate totals in case empty ones were removed
      const sub = p.subTasks || [];
      const completedCount = sub.filter(t => t.status === 'done').length;
      let newPhaseStatus: TrackerPhase['status'] = p.status;
      if (sub.length > 0) {
        if (completedCount === sub.length) newPhaseStatus = 'complete';
        else if (completedCount === 0 && sub.every(t => t.status === 'todo')) newPhaseStatus = 'not-started';
        else newPhaseStatus = 'in-progress';
      }
      return {
        ...p,
        completed: completedCount,
        total: sub.length,
        status: newPhaseStatus
      }
    });

    onSave(cleanedPhases);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-surface shadow-xl ring-1 ring-border-light overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Edit Research Plan</h2>
            <p className="mt-1 text-xs text-text-secondary">
              Customize the phases and checklist items for your research tracker.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-tertiary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-surface-secondary/30">
          <div className="flex flex-col gap-8">
            {draftPhases.map((phase) => (
              <div key={phase.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-text-primary">{phase.name}</h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {phase.subTasks?.map((task) => (
                    <div key={task.id} className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={task.label}
                        onChange={(e) => handleUpdateTaskLabel(phase.id, task.id, e.target.value)}
                        placeholder="Task description..."
                        className="flex-1 rounded-lg border border-border bg-surface-secondary/50 px-3 py-2 text-xs text-text-primary outline-none transition-colors focus:border-primary-400 focus:bg-surface focus:ring-1 focus:ring-primary-400/20"
                        autoFocus={task.label === ''}
                      />
                      <button
                        onClick={() => handleDeleteTask(phase.id, task.id)}
                        className="group flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete task"
                      >
                        <Trash2 size={14} className="transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => handleAddTask(phase.id)}
                    className="mt-1 flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                  >
                    <Plus size={14} />
                    Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
