// ============================================================
// Mock Data for Research Assistant App
// ============================================================

export interface SourceFile {
  id: string;
  name: string;
  size: string;
  category: string;
  fileObject?: File;
  serverId?: string;   // Backend filename (UUID) from /upload/files
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface HistorySession {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  messages: ChatMessage[];
}

export interface InsightQuote {
  id: string;
  category: string;
  categoryColor: string;
  quote: string;
  interviewee: string;
  role: string;
  sourceFile: string;
  lineNumber: number;
}

export interface Artifact {
  id: string;
  type: 'PDF' | 'RPT' | 'DOC' | 'CSV';
  title: string;
  generatedDate: string;
  metadata: string;
  action: 'Download' | 'View';
}

export interface SubTask {
  id: string;
  label: string;
  status: 'done' | 'in-progress' | 'todo';
}

export interface TrackerPhase {
  id: string;
  name: string;
  completed: number;
  total: number;
  status: 'complete' | 'in-progress' | 'not-started';
  expanded?: boolean;
  subTasks?: SubTask[];
}

export interface ActivityEvent {
  id: string;
  message: string;
  highlight?: string;
  time: string;
  dotColor: string;
}

// ---- Sources ----
export const sourceFiles: SourceFile[] = [];

// ---- History ----
export const historySessions: HistorySession[] = [];

// ---- Insights ----
export const insightCategories = [
  'PRICING TRANSPARENCY',
  'NETWORK FRAGMENTATION',
  'CHARGER RELIABILITY',
  'FLEET USE CASE',
  'ADOPTION BARRIER',
];

export const insightQuotes: InsightQuote[] = [];

// ---- Artifacts ----
export const artifacts: Artifact[] = [];

// ---- Tracker ----
export const trackerPhases: TrackerPhase[] = [
  { 
    id: '1', 
    name: 'Discovery & Scoping', 
    completed: 0, 
    total: 4, 
    status: 'in-progress',
    expanded: true,
    subTasks: [
      { id: 'p1s1', label: 'Define target persona', status: 'todo' },
      { id: 'p1s2', label: 'Review competitor landscape', status: 'todo' },
      { id: 'p1s3', label: 'Establish research goals', status: 'todo' },
      { id: 'p1s4', label: 'Write interview screener', status: 'todo' },
    ]
  },
  { 
    id: '2', 
    name: 'Customer Discovery', 
    completed: 0, 
    total: 5, 
    status: 'not-started',
    subTasks: [
      { id: 'p2s1', label: 'Recruit 10 fleet operators', status: 'todo' },
      { id: 'p2s2', label: 'Conduct 3 pilot interviews', status: 'todo' },
      { id: 'p2s3', label: 'Refine interview script', status: 'todo' },
      { id: 'p2s4', label: 'Complete remaining interviews', status: 'todo' },
      { id: 'p2s5', label: 'Upload transcripts for analysis', status: 'todo' },
    ]
  },
  {
    id: '3',
    name: 'Problem Validation',
    completed: 0,
    total: 5,
    status: 'not-started',
    subTasks: [
      { id: 's1', label: 'Synthesize top pain points', status: 'todo' },
      { id: 's2', label: 'Identify gaps vs. market reports', status: 'todo' },
      { id: 's3', label: 'Conduct 2 more validation interviews', status: 'todo' },
      { id: 's4', label: 'Map themes to use case framework', status: 'todo' },
      { id: 's5', label: 'Draft validation summary', status: 'todo' },
    ],
  },
  { 
    id: '4', 
    name: 'Solution Exploration', 
    completed: 0, 
    total: 4, 
    status: 'not-started',
    subTasks: [
      { id: 'p4s1', label: 'Brainstorm "How Might We" statements', status: 'todo' },
      { id: 'p4s2', label: 'Map user journey for transparent pricing', status: 'todo' },
      { id: 'p4s3', label: 'Develop 3 initial solution concepts', status: 'todo' },
      { id: 'p4s4', label: 'Conduct internal team review', status: 'todo' },
    ]
  },
  { 
    id: '5', 
    name: 'Prototyping & MVP', 
    completed: 0, 
    total: 3, 
    status: 'not-started',
    subTasks: [
      { id: 'p5s1', label: 'Build low-fi Figma wireframes', status: 'todo' },
      { id: 'p5s2', label: 'Run 5 usability tests', status: 'todo' },
      { id: 'p5s3', label: 'Synthesize feedback and iterate', status: 'todo' },
    ]
  },
];

// ---- Recent Activity ----
export const recentActivity: ActivityEvent[] = [];
