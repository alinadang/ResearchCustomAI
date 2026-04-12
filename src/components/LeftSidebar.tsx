import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Search,
  Users,
  Settings,
  FolderKanban,
  Plus,
  MoreHorizontal,
  Clock,
  UserPlus,
  Shield,
  Bell,
  Palette,
  Globe,
  ChevronRight,
  Trash2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { type SourceFile } from '../data/mockData';
import FilePreviewModal from './FilePreviewModal';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

type SidebarTab = 'search' | 'project' | 'team' | 'settings';

const navItems: { id: SidebarTab; icon: React.ElementType; label: string }[] = [
  { id: 'search', icon: Search, label: 'Sources' },
  { id: 'project', icon: FolderKanban, label: 'Project' },
  { id: 'team', icon: Users, label: 'Team' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function LeftSidebar({ 
  isOpen = true, 
  onPanelOpen 
}: { 
  isOpen?: boolean; 
  onPanelOpen?: () => void; 
}) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('search');

  return (
    <aside className="flex h-screen border-r border-border bg-surface">
      {/* Icon rail */}
      <div className="flex w-12 flex-col items-center border-r border-border-light bg-surface py-4">
        {/* Logo */}
        <div className="mb-6 flex h-8 w-8 items-center justify-center">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-full object-contain" />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onPanelOpen?.();
                }}
                title={item.label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </nav>

        {/* User avatar */}
        <UserAvatarButton />
      </div>

      {/* Panel content — switches based on active tab */}
      <div 
        className={`transition-[width] duration-300 ease-in-out flex flex-col overflow-hidden border-l border-border-light ${
          isOpen ? 'w-[240px]' : 'w-0 border-transparent'
        }`}
      >
        <div className="w-[240px] flex h-full flex-col overflow-y-auto">
          {activeTab === 'search' && <SourcesPanel />}
          {activeTab === 'project' && <ProjectPanel />}
          {activeTab === 'team' && <TeamPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </aside>
  );
}

/* ================================================================
   SOURCES PANEL (main/search tab)
   ================================================================ */
function SourcesPanel() {
  const {
    sourceFiles: files,
    setSourceFiles: setFiles,
    sourceCategories: categories,
    setSourceCategories: setCategories,
    addActivity,
  } = useAppContext();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SourceFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    let uploadedFiles: File[] = [];
    if ('dataTransfer' in e) {
      uploadedFiles = Array.from((e as React.DragEvent).dataTransfer.files);
    } else if (e.target && 'files' in e.target) {
      const target = e.target as HTMLInputElement;
      uploadedFiles = Array.from(target.files || []);
    }

    if (uploadedFiles.length > 0) {
      const newSourceFiles: SourceFile[] = uploadedFiles.map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        category: 'Uncategorized',
        fileObject: file
      }));
      setFiles(prev => [...prev, ...newSourceFiles]);

      // Upload to backend (fire-and-forget with error logging)
      import('../api').then(({ uploadFiles: apiUploadFiles }) => {
        apiUploadFiles(uploadedFiles)
          .then((res) => {
            // Update IDs to use server-assigned filenames for future reference
            setFiles(prev =>
              prev.map(f => {
                const match = res.uploaded.find(u => u.original_name === f.name);
                return match ? { ...f, serverId: match.saved_as } : f;
              })
            );
            addActivity(
              `${res.uploaded.length} file(s) uploaded to server`,
              `${res.uploaded.length} file(s)`,
              '#22c55e',
            );
          })
          .catch((err) => {
            console.warn('[LeftSidebar] Backend upload failed (files still available locally):', err);
          });
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories(prev => [...prev, newCategoryName.trim()]);
    }
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleMoveFile = (fileId: string, destCategory: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, category: destCategory } : f));
  };

  const uncategorizedFiles = files.filter(f => f.category === 'Uncategorized');

  return (
    <div className="flex flex-1 flex-col px-3 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Sources</h2>
          <button 
            onClick={() => setIsAddingCategory(!isAddingCategory)} 
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary transition-colors hover:bg-surface-tertiary hover:text-primary-600 border border-transparent hover:border-border"
            title="Create new folder"
          >
            <Plus size={12} />
            Add folder
          </button>
        </div>
        <span className="text-xs text-text-tertiary">{files.length} files</span>
      </div>

      {isAddingCategory && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 shadow-sm">
          <input 
            autoFocus
            type="text" 
            placeholder="New folder name..." 
            className="w-full bg-transparent text-xs outline-none text-text-primary placeholder:text-primary-300"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateCategory();
              else if (e.key === 'Escape') setIsAddingCategory(false);
            }}
          />
        </div>
      )}

      <div
        className={`mb-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-5 transition-colors ${
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-border bg-surface-secondary hover:border-primary-300 hover:bg-primary-50/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleFileUpload}
      >
        <Upload size={20} className="mb-1.5 text-text-tertiary" />
        <span className="text-xs font-medium text-text-secondary">Drop files here</span>
        <span className="text-[10px] text-text-tertiary">PDF, DOCX, TXT, CSV</span>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          onChange={handleFileUpload} 
        />
      </div>

      {uncategorizedFiles.length > 0 && (
        <FileGroup 
          title="Uncategorized" 
          count={uncategorizedFiles.length} 
          files={uncategorizedFiles} 
          onFileClick={setSelectedFile} 
          onDeleteFile={handleDeleteFile}
          isUncategorized
        />
      )}

      {categories.map(category => {
        const categoryFiles = files.filter(f => f.category === category);
        return (
          <FileGroup 
            key={category} 
            title={category} 
            count={categoryFiles.length} 
            files={categoryFiles} 
            onFileClick={setSelectedFile} 
            onDeleteFile={handleDeleteFile}
            onDropFile={handleMoveFile}
          />
        );
      })}
      
      {selectedFile && (
        <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  );
}

/* ================================================================
   PROJECT PANEL
   ================================================================ */
function ProjectPanel() {
  const projects = [
    { name: 'EV Charging Research', status: 'Active', filesCount: 5, lastUpdated: '2h ago' },
    { name: 'Fleet Depot Analysis', status: 'Draft', filesCount: 2, lastUpdated: '3d ago' },
  ];

  return (
    <div className="flex flex-1 flex-col px-3 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Projects</h2>
        <button className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-tertiary hover:text-primary-600">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {projects.map((project) => (
          <div
            key={project.name}
            className="group cursor-pointer rounded-lg border border-border bg-surface-secondary p-3 transition-all hover:border-primary-200 hover:shadow-sm"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary truncate">{project.name}</span>
              <MoreHorizontal size={14} className="shrink-0 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                project.status === 'Active'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-100 text-text-tertiary'
              }`}>
                {project.status}
              </span>
              <span className="text-[10px] text-text-tertiary">{project.filesCount} files</span>
              <span className="text-[10px] text-text-tertiary">· {project.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border-light pt-4">
        <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">Recent</h3>
        <div className="flex flex-col gap-1">
          {['Theme Extraction', 'Interview Guide Gen', 'Gap Analysis'].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-secondary cursor-pointer hover:bg-surface-tertiary transition-colors">
              <Clock size={12} className="shrink-0 text-text-tertiary" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TEAM PANEL
   ================================================================ */
function TeamPanel() {
  const members = [
    { name: 'Alex L.', initials: 'AL', role: 'Owner', color: 'bg-primary-600' },
    { name: 'Sarah K.', initials: 'SK', role: 'Editor', color: 'bg-violet-500' },
    { name: 'James R.', initials: 'JR', role: 'Viewer', color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-1 flex-col px-3 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Team</h2>
        <button className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-tertiary hover:text-primary-600">
          <UserPlus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-2.5 rounded-md px-2 py-2 cursor-pointer hover:bg-surface-tertiary transition-colors"
          >
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${member.color} text-[10px] font-semibold text-white`}>
              {member.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-text-primary truncate">{member.name}</p>
              <p className="text-[10px] text-text-tertiary">{member.role}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-text-tertiary transition-colors hover:border-primary-300 hover:text-primary-600">
        <UserPlus size={14} />
        Invite teammate
      </button>

      <div className="mt-5 border-t border-border-light pt-4">
        <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">Sharing</h3>
        <div className="rounded-lg border border-border bg-surface-secondary p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={12} className="text-text-tertiary" />
            <span className="text-xs font-medium text-text-primary">Private project</span>
          </div>
          <p className="text-[10px] text-text-tertiary leading-relaxed">
            Only team members can access this workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SETTINGS PANEL
   ================================================================ */
function SettingsPanel() {
  const settingsGroups = [
    {
      label: 'General',
      items: [
        { icon: Globe, name: 'Language', value: 'English' },
        { icon: Palette, name: 'Appearance', value: 'Light' },
        { icon: Bell, name: 'Notifications', value: 'On' },
      ],
    },
    {
      label: 'Project',
      items: [
        { icon: FolderKanban, name: 'Default project', value: 'EV Charging' },
        { icon: FileText, name: 'Export format', value: 'PDF' },
      ],
    },
  ];

  return (
    <div className="flex flex-1 flex-col px-3 py-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
      </div>

      {settingsGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
            {group.label}
          </h3>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className="flex items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-tertiary cursor-pointer"
                >
                  <Icon size={14} className="shrink-0 text-text-tertiary" />
                  <span className="flex-1 text-xs font-medium text-text-primary">{item.name}</span>
                  <span className="text-[10px] text-text-tertiary">{item.value}</span>
                  <ChevronRight size={12} className="shrink-0 text-text-tertiary" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   FILE GROUP (reused in Sources panel)
   ================================================================ */
function FileGroup({
  title,
  count,
  files,
  onFileClick,
  onDeleteFile,
  onDropFile,
  isUncategorized,
}: {
  title: string;
  count: number;
  files: SourceFile[];
  onFileClick: (file: SourceFile) => void;
  onDeleteFile?: (id: string) => void;
  onDropFile?: (fileId: string, destCategory: string) => void;
  isUncategorized?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div 
      className={`mb-4 transition-colors ${isUncategorized ? 'rounded-lg border border-amber-200 bg-amber-50/50 p-2' : ''} ${isDragOver && !isUncategorized ? 'rounded-lg ring-2 ring-primary-400 bg-primary-50/30' : ''}`}
      onDragOver={(e) => {
        if (!isUncategorized) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!isUncategorized) {
          e.preventDefault();
          setIsDragOver(false);
          const fileId = e.dataTransfer.getData('text/plain');
          if (fileId && onDropFile) {
            onDropFile(fileId, title);
          }
        }
      }}
    >
      <div className={`mb-2 flex items-center ${isUncategorized ? 'justify-center px-1' : 'justify-between'}`}>
        {!isUncategorized ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold tracking-wide uppercase text-text-secondary">
              {title}
            </span>
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1.5 text-[9px] font-bold bg-surface-tertiary text-text-tertiary">
              {count}
            </span>
          </div>
        ) : (
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 shrink-0">
            Drag to move
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {files.length === 0 && !isUncategorized && (
          <div className="text-[10px] text-text-tertiary italic px-2 py-1">Drop files here</div>
        )}
        {files.map((file) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', file.id);
            }}
            onClick={() => onFileClick(file)}
            className={`group flex items-center justify-between rounded-md px-2 py-1.5 transition-colors cursor-grab active:cursor-grabbing hover:bg-surface-tertiary ${isUncategorized ? 'bg-amber-100/40 hover:bg-amber-100' : ''}`}
          >
            <div className="flex items-start gap-2 min-w-0 pr-2">
              <FileText size={14} className="mt-0.5 shrink-0 text-text-tertiary" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-text-primary">{file.name}</p>
                <p className="text-[10px] text-text-tertiary">{file.size}</p>
              </div>
            </div>
            {onDeleteFile && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }} 
                className="opacity-0 group-hover:opacity-100 p-1.5 text-text-tertiary hover:text-red-600 rounded-md hover:bg-red-50 transition-all shrink-0"
                title="Delete file"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   USER AVATAR BUTTON (bottom of icon rail)
   ================================================================ */
function UserAvatarButton() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          title="Log in"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-text-tertiary text-text-tertiary transition-colors hover:border-primary-400 hover:text-primary-600"
        >
          <LogIn size={14} />
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        title={user.username}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white transition-transform hover:scale-105"
      >
        {initials}
      </button>

      {showMenu && (
        <div className="absolute bottom-10 left-0 z-50 w-40 rounded-lg border border-border bg-surface p-1 shadow-lg">
          <div className="px-3 py-2 border-b border-border-light mb-1">
            <p className="text-xs font-semibold text-text-primary truncate">{user.username}</p>
            <p className="text-[10px] text-text-tertiary truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); setShowMenu(false); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
