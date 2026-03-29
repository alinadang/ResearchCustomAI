import { useState, useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { type SourceFile } from '../data/mockData';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Component to render actual uploaded files
function ActualDocumentPreview({ fileObject }: { fileObject: File }) {
  const [textContent, setTextContent] = useState<string>('');
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    if (fileObject.type.startsWith('image/')) {
      const url = URL.createObjectURL(fileObject);
      setImgUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    
    if (fileObject.name.endsWith('.txt') || fileObject.name.endsWith('.csv') || fileObject.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent((e.target?.result as string).slice(0, 800));
      };
      reader.readAsText(fileObject);
    }
  }, [fileObject]);

  if (fileObject.type === 'application/pdf' || fileObject.name.toLowerCase().endsWith('.pdf')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white overflow-hidden text-black pointer-events-none">
        <Document
          file={fileObject}
          loading={<div className="flex flex-col items-center justify-center h-full w-full text-gray-400"><FileText className="mb-2" size={32} /><span>Loading PDF...</span></div>}
          className="flex justify-center scale-[0.6] origin-top opacity-90 transition-opacity"
        >
          <Page pageNumber={1} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>
    );
  }

  if (imgUrl) {
    return (
      <img src={imgUrl} className="h-full w-full object-cover" alt="Document Preview" />
    );
  }

  if (textContent) {
    return (
      <div className="h-full w-full p-6 bg-white overflow-hidden text-left text-[11px] leading-relaxed font-mono text-gray-800 break-words whitespace-pre-wrap select-none border-t-[8px] border-gray-200">
        <span className="font-bold mb-2 block text-gray-400 border-b border-gray-200 pb-2">{fileObject.name}</span>
        {textContent}...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400 border border-gray-100">
      <FileText size={48} className="mb-2 opacity-50" />
      <span className="text-sm font-medium">No preview available</span>
      <span className="text-[10px] mt-1">{fileObject.type || 'Unknown format'}</span>
    </div>
  );
}

// Component to render mock document text (replacing the AI cover card for txt files)
function MockDocumentView() {
  return (
    <div className="flex h-full w-full flex-col bg-white p-6 text-left overflow-hidden border border-gray-200 text-gray-800 pointer-events-none rounded-[14px]">
      <div className="text-[10px] leading-relaxed font-sans pr-2 h-full uppercase-first">
        <h3 className="font-semibold text-[11px] mb-1">I. Introduction (5 minutes)</h3>
        <p className="mb-0.5 text-[9px] font-medium">Script:</p>
        <p className="mb-3 text-[9px] text-gray-700 leading-snug">
          "Thank you, Emily, for taking the time to speak with me. I'm part of a team exploring the use cases and end-user applications of a digital pathology technology called the Multi-Camera Array Scanner (MCAS). It's designed to rapidly scan biological samples using 48 mini-cameras to generate a high-resolution 3D model, cutting turnaround times from hours to minutes while enabling remote diagnostics.<br/><br/>
          We're hoping to learn from your expertise in informatics, data integration, and oncology operations — especially regarding how tools like this might fit into research and clinical workflows at Duke."
        </p>

        <p className="mb-1 text-[9px] font-medium">Known facts / relevant background:</p>
        <ul className="list-disc pl-4 mb-4 space-y-0.5 text-[8.5px] leading-tight">
          <li>Emily Norboge is the Chief Research Informatics Officer at Duke Cancer Institute.</li>
          <li>Oversees informatics efforts across clinical care and research, including custom solution development.</li>
          <li>Involved in partnerships leveraging generative AI, remote monitoring, and digital health models.</li>
          <li>Co-chairs the Shared Resource Oversight Committee at DCI.</li>
        </ul>

        <hr className="my-3 border-gray-300" />
        
        <h3 className="font-semibold text-[11px] mb-2">II. Background & Context (5 minutes)</h3>
        <ul className="list-disc pl-4 mb-3 space-y-1 text-[9px] leading-snug">
          <li>Could you share a bit about your current role and experience as Chief Research Informatics Officer?</li>
          <li>How do imaging data and pathology systems currently integrate into research workflows at Duke?</li>
        </ul>

        <div className="border border-black p-2 mb-2 rounded-[2px] bg-white">
          <ul className="list-disc pl-4 space-y-1 text-[8px] leading-tight">
            <li>Oversee anything IT and informatics related at Duke
              <ul className="list-[circle] pl-3 mt-0.5 space-y-0.5">
                <li>Optimization for AI/cancer care</li>
                <li>Collaboration with vendors to do better imaging of slides</li>
              </ul>
            </li>
            <li className="mt-1">Pathology systems are separate and it's integration
              <ul className="list-[circle] pl-3 mt-0.5 space-y-0.5">
                <li>Significant potential for data integration</li>
                <li>From a research perspective, looking at patterns</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Component to render mock PDF as a presentation slide
function MockPdfPresentationView({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-center border border-gray-700 pointer-events-none rounded-[14px] overflow-hidden relative">
      <div className="absolute top-4 left-6 text-white/30 font-bold text-[10px] tracking-[0.2em] uppercase">Research Deck</div>
      <div className="absolute bottom-4 right-6 text-white/40 text-[9px]">Strictly Confidential</div>
      
      <div className="w-12 h-1 bg-primary-500 mb-6 rounded-full opacity-80"></div>
      
      <h1 className="text-xl font-bold text-white mb-4 px-8 leading-tight drop-shadow-lg">
        {title}
      </h1>
      <p className="text-indigo-200 text-xs tracking-wide max-w-[80%] opacity-70 font-light">
        Executive Summary & Findings
      </p>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-50">
        <div className="w-1 h-1 rounded-full bg-white"></div>
        <div className="w-1 h-1 rounded-full bg-white/40"></div>
        <div className="w-1 h-1 rounded-full bg-white/40"></div>
      </div>
    </div>
  );
}

function getPreviewDetails(fileName: string, category: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, ""); // strip extension
  const title = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); // Title Case
  
  let subtitle = category === 'Interviews' ? 'Interview Transcript' : 'Research Document';
  let date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  let metadata = 'System AI Indexed';
  
  // Theme styling based on file name or category
  let bgClass = 'bg-[#124248]';
  let accentClass = 'bg-[#4FC9A9]';
  let textAccent = 'text-[#4FC9A9]';

  if (category === 'Interviews') {
    bgClass = 'bg-[#1e1b4b]';
    accentClass = 'bg-[#818cf8]';
    textAccent = 'text-[#818cf8]';
    metadata = 'Audio Transcription';
  } else if (fileName.toLowerCase().includes('report') || fileName.toLowerCase().includes('analysis')) {
    bgClass = 'bg-[#0f172a]';
    accentClass = 'bg-[#38bdf8]';
    textAccent = 'text-[#38bdf8]';
    metadata = 'Market Intelligence Data';
  } else if (fileName.toLowerCase().endsWith('.csv')) {
    bgClass = 'bg-[#14532d]';
    accentClass = 'bg-[#4ade80]';
    textAccent = 'text-[#4ade80]';
    metadata = 'Tabular Dataset';
    subtitle = 'Data Structure';
  }

  return { title, subtitle, date, metadata, bgClass, accentClass, textAccent };
}

const getMockFileContent = (file: SourceFile, details: any) => {
  if (file.category === 'Interviews') {
    return `TRANSCRIPT: ${details.title}\nDate: ${details.date}\nStatus: Indexed\n\n[00:00:00] Interviewer: Thank you for taking the time to speak with us today. Can you start by explaining your current workflow and experience?\n[00:00:15] Subject: Absolutely. We've been heavily focused on ways to streamline our processes recently...\n[00:00:45] Interviewer: That's very helpful. What are the primary pain points you are trying to solve right now?\n[00:00:52] Subject: Mostly, it comes down to a lack of transparency and fragmentation in the tooling we rely on...`;
  }
  
  return `RESEARCH DOCUMENT: ${details.title}\nDate: ${details.date}\nStatus: Indexed\n\nEXECUTIVE SUMMARY\nThis document provides a distilled overview of the key insights regarding ${details.title.toLowerCase()}.\n\n1. METHODOLOGY\nOur analysis is constructed from aggregated qualitative inputs, industry metrics, and recent observable market trends within the sector.\n\n2. KEY FINDINGS\n- The landscape is subject to rapid transformation driven by user expectations.\n- Consistent pain points revolve around reliability and fragmented user experiences.\n- Emerging solutions are leaning heavily into automated processing and centralized dashboards.\n\n3. CONCLUSION\nThe findings confirm the hypothesis that there are significant gaps in the current market offerings. Immediate strategic focus should be assigned to bridging these identified friction points.`;
};

export default function FilePreviewModal({ 
  file, 
  onClose 
}: { 
  file: SourceFile; 
  onClose: () => void 
}) {
  const details = getPreviewDetails(file.name, file.category);
  
  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.fileObject?.type === 'application/pdf';
  const isTxt = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.docx') || file.category === 'Interviews';
  
  // Apply dynamic aspect ratio: Landscape for PDF, Vertical for TXT, fallback 4:2.6
  let aspectClass = 'aspect-[4/2.6] max-w-[480px]';
  if (isPdf) {
    aspectClass = 'aspect-[16/9] max-w-[560px]';
  } else if (isTxt) {
    aspectClass = 'aspect-[8.5/11] max-w-[380px]';
  }

  const handleDownload = () => {
    // If we have a real file object, we should download IT directly
    if (file.fileObject) {
      const url = URL.createObjectURL(file.fileObject);
      const element = document.createElement("a");
      element.href = url;
      element.download = file.fileObject.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      return;
    }

    // Otherwise download the mocked AI context
    const element = document.createElement("a");
    const fileContent = getMockFileContent(file, details);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    element.href = URL.createObjectURL(blob);
    const downloadName = file.name.replace(/\.[^/.]+$/, "") + ".txt";
    element.download = downloadName;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const showMockTextDocument = !file.fileObject && isTxt;
  const showMockPdfSlide = !file.fileObject && isPdf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative flex w-full max-w-[600px] flex-col rounded-[20px] bg-white p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-text-tertiary transition-colors z-10 hover:bg-surface-secondary hover:text-text-primary"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
        
        <h2 className="mb-6 mr-8 text-[22px] font-semibold text-gray-900 leading-tight break-all">
          {file.name}
        </h2>
        
        <div 
          onClick={handleDownload}
          className={`group relative mx-auto flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-[3px] border-transparent transition-all hover:border-primary-500 hover:shadow-xl p-1 ${aspectClass}`}
          title={file.fileObject ? "Click to download original file" : "Click to download mock file text"}
        >
          {/* Stacked cards effect for "multiple pages" */}
          <div className="relative w-full h-full">
            {/* Background page 2 */}
            <div className="absolute right-1 top-2 h-full w-[calc(100%-8px)] rounded-xl bg-gray-50 shadow-sm border border-gray-100"></div>
            {/* Background page 1 */}
            <div className="absolute right-2 top-4 h-full w-[calc(100%-16px)] rounded-xl bg-gray-100 shadow-sm border border-gray-200/60"></div>
            
            {/* Main Cover Card */}
            <div className={`absolute left-0 right-4 top-6 h-[calc(100%-24px)] flex flex-col justify-center rounded-[14px] ${file.fileObject || showMockTextDocument || showMockPdfSlide ? 'bg-white' : details.bgClass} ${(!file.fileObject && !showMockTextDocument && !showMockPdfSlide) ? 'p-8' : ''} text-gray-800 shadow-md transition-transform group-hover:-translate-y-1 overflow-hidden`}>
              
              {(!file.fileObject && !showMockTextDocument && !showMockPdfSlide) && (
                 <>
                  {/* Left accent border */}
                  <div className={`absolute left-0 top-0 h-full w-2.5 rounded-l-xl ${details.accentClass}`}></div>
                  
                  <div className="pl-6 pt-2">
                    <h3 className="mb-2 text-[26px] font-bold tracking-tight text-white leading-tight line-clamp-3">
                      {details.title}
                    </h3>
                    <p className={`mb-8 text-sm font-medium ${details.textAccent}`}>
                      {details.subtitle}
                    </p>
                    
                    <div className="mt-auto space-y-2 text-[11px] font-medium text-white/50">
                      <p>Type: {details.metadata}</p>
                      <p>Indexed: {details.date}</p>
                    </div>
                  </div>
                 </>
              )}

              {showMockTextDocument && !file.fileObject && (
                <MockDocumentView />
              )}

              {showMockPdfSlide && !file.fileObject && (
                <MockPdfPresentationView title={details.title} />
              )}

              {file.fileObject && (
                <ActualDocumentPreview fileObject={file.fileObject} />
              )}

              {/* Download overlay icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center rounded-[14px] bg-black/0 transition-colors group-hover:bg-black/20">
                <div className="flex flex-col h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-white opacity-0 shadow-2xl transition-all group-hover:opacity-100 group-hover:scale-110">
                  <Download size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-center bg-white px-6 py-2">
          <span className="text-[15px] font-medium text-gray-800">
            {file.fileObject ? (file.fileObject.size / 1024 / 1024).toFixed(2) + ' MB' : (file.category === 'Research Papers' ? '12 pages' : '5 pages')}
          </span>
        </div>
      </div>
    </div>
  );
}
