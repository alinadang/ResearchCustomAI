import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Edit2
} from 'lucide-react';
import { trackerPhases, recentActivity, type TrackerPhase, type SubTask } from '../data/mockData';
import EditTrackerModal from './EditTrackerModal';

export default function RightSidebar({ isOpen = true }: { isOpen?: boolean }) {
  const [phases, setPhases] = useState(trackerPhases);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Recalculate open count safely
  const openCount = phases.filter((p) => p.status === 'in-progress').length +
    phases.reduce((acc, p) => acc + (p.subTasks?.filter((t) => t.status === 'in-progress').length ?? 0), 0);

  const toggleExpand = (id: string) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, expanded: !p.expanded } : p))
    );
  };

  const toggleSubTask = (phaseId: string, taskId: string) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId || !p.subTasks) return p;
      
      const newSubTasks = p.subTasks.map(t => {
        if (t.id !== taskId) return t;
        const nextStatus = t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo';
        return { ...t, status: nextStatus as SubTask['status'] };
      });
      
      const completedCount = newSubTasks.filter(t => t.status === 'done').length;
      let newPhaseStatus = p.status;
      if (completedCount === p.total) newPhaseStatus = 'complete';
      else if (completedCount === 0 && newSubTasks.every(t => t.status === 'todo')) newPhaseStatus = 'not-started';
      else newPhaseStatus = 'in-progress';

      return { ...p, subTasks: newSubTasks, completed: completedCount, status: newPhaseStatus };
    }));
  };

  return (
    <aside 
      className={`flex h-screen shrink-0 flex-col bg-surface transition-[width] duration-300 ease-in-out border-border overflow-hidden ${
        isOpen ? 'w-[280px] border-l' : 'w-0 border-transparent'
      }`}
    >
      <div className="w-[280px] h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
        <h2 className="text-sm font-semibold text-text-primary">Tracker</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
            {openCount} open
          </span>
          <button 
            onClick={() => setIsEditingPlan(true)}
            className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      {/* Phases */}
      <div className="flex-1 px-5 py-4">
        <div className="flex flex-col gap-1">
          {phases.map((phase) => (
            <PhaseItem 
              key={phase.id} 
              phase={phase} 
              onToggle={toggleExpand} 
              onToggleSubTask={toggleSubTask} 
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-border-light px-5 py-4">
        <h3 className="mb-3 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
          Recent Activity
        </h3>
        <div className="flex flex-col gap-3">
          {recentActivity.map((event) => (
            <div key={event.id} className="flex items-start gap-2.5">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: event.dotColor }}
              />
              <div className="min-w-0">
                <p className="text-xs text-text-secondary leading-relaxed">
                  {event.highlight ? (
                    <>
                      {event.message.split(event.highlight).map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="font-semibold text-text-primary">
                              {event.highlight}
                            </span>
                          )}
                        </span>
                      ))}
                    </>
                  ) : (
                    event.message
                  )}
                </p>
                <p className="mt-0.5 text-[10px] text-text-tertiary">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      {/* Modal is rendered outside the aside flow so it overlays everything */}
      {isEditingPlan && (
        <EditTrackerModal 
          phases={phases} 
          onSave={(newPhases: TrackerPhase[]) => {
            setPhases(newPhases);
            setIsEditingPlan(false);
          }} 
          onClose={() => setIsEditingPlan(false)} 
        />
      )}
    </aside>
  );
}

function PhaseItem({
  phase,
  onToggle,
  onToggleSubTask,
}: {
  phase: TrackerPhase;
  onToggle: (id: string) => void;
  onToggleSubTask: (phaseId: string, taskId: string) => void;
}) {
  const statusDotColor =
    phase.status === 'complete'
      ? 'bg-status-green'
      : phase.status === 'in-progress'
        ? 'bg-status-blue'
        : 'bg-status-gray';

  const hasSubTasks = phase.subTasks && phase.subTasks.length > 0;

  return (
    <div>
      <button
        onClick={() => hasSubTasks && onToggle(phase.id)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors ${
          hasSubTasks ? 'cursor-pointer hover:bg-surface-tertiary' : 'cursor-default'
        }`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotColor}`} />
        <span className="flex-1 text-xs font-medium text-text-primary">{phase.name}</span>
        <span className="text-xs text-text-tertiary">
          {phase.completed}/{phase.total}
        </span>
        {hasSubTasks && (
          <span className="text-text-tertiary">
            {phase.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </button>

      {/* Sub-tasks */}
      {phase.expanded && phase.subTasks && (
        <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-border-light pl-3 pb-2">
          {phase.subTasks.map((task) => (
            <SubTaskItem 
              key={task.id} 
              task={task} 
              onToggle={() => onToggleSubTask(phase.id, task.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubTaskItem({ task, onToggle }: { task: SubTask; onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className="flex items-start gap-2 rounded py-1 px-1 hover:bg-surface-tertiary transition-colors text-left"
    >
      {task.status === 'done' ? (
        <CheckSquare size={14} className="mt-0.5 shrink-0 text-status-green" />
      ) : task.status === 'in-progress' ? (
        <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-sm bg-status-orange" />
        </span>
      ) : (
        <Square size={14} className="mt-0.5 shrink-0 text-text-tertiary" />
      )}
      <span
        className={`text-xs leading-relaxed ${
          task.status === 'done'
            ? 'text-text-secondary line-through'
            : task.status === 'in-progress'
              ? 'text-text-primary'
              : 'text-text-secondary'
        }`}
      >
        {task.label}
      </span>
    </button>
  );
}
