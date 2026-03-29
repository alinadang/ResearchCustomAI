// ============================================================
// Mock Data for Research Assistant App
// ============================================================

export interface SourceFile {
  id: string;
  name: string;
  size: string;
  category: string;
  fileObject?: File;
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
export const sourceFiles: SourceFile[] = [
  { id: '1', name: 'EV_market_analysis_2025.pdf', size: '2.4 MB', category: 'Research Papers' },
  { id: '2', name: 'charging_infra_report.pdf', size: '1.8 MB', category: 'Research Papers' },
  { id: '3', name: 'interview_sarah_k.txt', size: '18 KB', category: 'Interviews' },
  { id: '4', name: 'interview_mark_t.txt', size: '22 KB', category: 'Interviews' },
  { id: '5', name: 'interview_priya_m.txt', size: '15 KB', category: 'Interviews' },
];

// ---- History ----
export const historySessions: HistorySession[] = [
  {
    id: '1',
    title: 'Theme Extraction — Pricing & Transparency',
    date: 'Feb 24, 2026',
    description:
      'Analyzed 3 transcripts for pricing-related pain points. Identified "cost opacity" as a top underresearched theme across all interviews. Cross-referenced with market reports — gap confirmed.',
    tags: ['3 sources', '5 themes', '12 quotes extracted'],
    messages: [
      { id: 'm1', role: 'user', content: 'Can you analyze the transcripts from Mark, Sarah, and Priya and extract common pain points around pricing?' },
      { id: 'm2', role: 'assistant', content: 'I have analyzed the 3 submitted transcripts. Both Mark and Priya explicitly called out "cost opacity" — not knowing the price until after plugging in — as a major frustration. Sarah mentioned variable pricing across different networks.' },
      { id: 'm3', role: 'user', content: 'Are there any market reports confirming this gap?' },
      { id: 'm4', role: 'assistant', content: 'Yes, looking at `charging_infra_report.pdf`, section 4 highlights that while consumer EV sales dropped, user dissatisfaction centered on network reliability and fragmentation, but did not strongly capture cost opacity. This suggests an under-researched gap.' }
    ]
  },
  {
    id: '2',
    title: 'Interview Guide Generation — Fleet Operators',
    date: 'Feb 21, 2026',
    description:
      'Generated a 10-question discovery guide targeting fleet & workplace charging use cases. Guide refined through 2 iterations based on prior interview findings.',
    tags: ['2 sources', '10 questions', 'exported to PDF'],
    messages: [
      { id: 'm1', role: 'user', content: 'Based on our last chat about fleet operators, generate a 10-question discovery guide.' },
      { id: 'm2', role: 'assistant', content: 'Here is a 10-question guide focusing on fleet charging needs, cost predictability, and depot management, formulated for open-ended discovery...' }
    ]
  },
  {
    id: '3',
    title: 'Gap Analysis — Market vs. Interview Data',
    date: 'Feb 18, 2026',
    description:
      'Compared themes from 3 interviews against 2 market research PDFs. Found 3 topics surfaced in interviews that are absent from published reports: pricing opacity, RFID fragmentation, and fleet depot needs.',
    tags: ['5 sources', '3 gaps identified'],
    messages: [
      { id: 'm1', role: 'user', content: 'Please compare my interview transcripts against the latest 2025 market analysis report.' },
      { id: 'm2', role: 'assistant', content: 'I found 3 distinct gaps where interviewees highlighted issues not captured in the recent market report: Pricing Opacity, RFID Fragmentation, and Depot needs.' }
    ]
  },
];

// ---- Insights ----
export const insightCategories = [
  'PRICING TRANSPARENCY',
  'NETWORK FRAGMENTATION',
  'CHARGER RELIABILITY',
  'FLEET USE CASE',
  'ADOPTION BARRIER',
];

export const insightQuotes: InsightQuote[] = [
  {
    id: '1',
    category: 'PRICING TRANSPARENCY',
    categoryColor: '#6366f1',
    quote:
      '"I don\'t know what I\'m going to pay until after I\'ve plugged in. It\'s the only purchase I make where I have zero idea of the cost upfront."',
    interviewee: 'Mark T.',
    role: 'EV fleet manager, 12 vehicles',
    sourceFile: 'interview_mark_t.txt',
    lineNumber: 84,
  },
  {
    id: '2',
    category: 'NETWORK FRAGMENTATION',
    categoryColor: '#8b5cf6',
    quote:
      '"Every network has a different pricing model — per kWh, per minute, flat session fee. I\'ve given up trying to compare them."',
    interviewee: 'Priya M.',
    role: 'EV commuter, 3 years experience',
    sourceFile: 'interview_priya_m.txt',
    lineNumber: 41,
  },
  {
    id: '3',
    category: 'CHARGER RELIABILITY',
    categoryColor: '#3b82f6',
    quote:
      '"I\'d say 1 out of every 4 chargers I pull up to is either broken, occupied, or just won\'t start. It makes trip planning stressful."',
    interviewee: 'Sarah K.',
    role: 'EV owner, 2 years',
    sourceFile: 'interview_sarah_k.txt',
    lineNumber: 29,
  },
  {
    id: '4',
    category: 'FLEET USE CASE',
    categoryColor: '#0ea5e9',
    quote:
      '"We need depot charging at predictable rates. The consumer model doesn\'t work for fleets — we can\'t have drivers roaming around looking for chargers."',
    interviewee: 'Mark T.',
    role: 'EV fleet manager, 12 vehicles',
    sourceFile: 'interview_mark_t.txt',
    lineNumber: 112,
  },
  {
    id: '5',
    category: 'ADOPTION BARRIER',
    categoryColor: '#f59e0b',
    quote:
      '"My building doesn\'t have charging, and asking my landlord to install it feels like asking permission to breathe. That\'s why I haven\'t switched yet."',
    interviewee: 'Priya M.',
    role: 'Potential EV buyer',
    sourceFile: 'interview_priya_m.txt',
    lineNumber: 67,
  },
];

// ---- Artifacts ----
export const artifacts: Artifact[] = [
  {
    id: '1',
    type: 'PDF',
    title: 'Fleet Operator Discovery Guide',
    generatedDate: 'Generated Feb 21',
    metadata: '10 questions · 2 pages',
    action: 'Download',
  },
  {
    id: '2',
    type: 'RPT',
    title: 'Theme Analysis — All Sources',
    generatedDate: 'Generated Feb 14',
    metadata: '5 themes · 18 quotes',
    action: 'View',
  },
  {
    id: '3',
    type: 'DOC',
    title: 'Gap Analysis Summary',
    generatedDate: 'Generated Feb 18',
    metadata: '3 gaps identified · reviewed',
    action: 'View',
  },
  {
    id: '4',
    type: 'CSV',
    title: 'Quotes Export — Pricing Transparency',
    generatedDate: 'Generated Feb 24',
    metadata: '12 quotes · 3 interviewees',
    action: 'Download',
  },
];

// ---- Tracker ----
export const trackerPhases: TrackerPhase[] = [
  { 
    id: '1', 
    name: 'Discovery & Scoping', 
    completed: 4, 
    total: 4, 
    status: 'complete',
    subTasks: [
      { id: 'p1s1', label: 'Define target persona', status: 'done' },
      { id: 'p1s2', label: 'Review competitor landscape', status: 'done' },
      { id: 'p1s3', label: 'Establish research goals', status: 'done' },
      { id: 'p1s4', label: 'Write interview screener', status: 'done' },
    ]
  },
  { 
    id: '2', 
    name: 'Customer Discovery', 
    completed: 5, 
    total: 5, 
    status: 'complete',
    subTasks: [
      { id: 'p2s1', label: 'Recruit 10 fleet operators', status: 'done' },
      { id: 'p2s2', label: 'Conduct 3 pilot interviews', status: 'done' },
      { id: 'p2s3', label: 'Refine interview script', status: 'done' },
      { id: 'p2s4', label: 'Complete remaining interviews', status: 'done' },
      { id: 'p2s5', label: 'Upload transcripts for analysis', status: 'done' },
    ]
  },
  {
    id: '3',
    name: 'Problem Validation',
    completed: 2,
    total: 5,
    status: 'in-progress',
    expanded: true,
    subTasks: [
      { id: 's1', label: 'Synthesize top pain points', status: 'done' },
      { id: 's2', label: 'Identify gaps vs. market reports', status: 'done' },
      { id: 's3', label: 'Conduct 2 more validation interviews', status: 'in-progress' },
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
export const recentActivity: ActivityEvent[] = [
  {
    id: '1',
    message: 'interview_james_r.txt uploaded, indexing…',
    highlight: 'interview_james_r.txt',
    time: '4m ago',
    dotColor: '#22c55e',
  },
  {
    id: '2',
    message: "AI extracted 3 new themes from Mark's transcript",
    highlight: '3 new themes',
    time: '22m ago',
    dotColor: '#3b82f6',
  },
  {
    id: '3',
    message: 'Task "Identify gaps vs. market reports" completed',
    highlight: '"Identify gaps vs. market reports"',
    time: '1h ago',
    dotColor: '#22c55e',
  },
];
