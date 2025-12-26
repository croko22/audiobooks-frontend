import React, { useState } from "react";
import { uploadBook } from "~/utils/api";
import { useNodes } from "~/contexts/NodeContext";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";

interface UploadFormProps {
  onUploadSuccess: () => void;
}

// Reverted parsing import
export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const { nodes } = useNodes();
  const [file, setFile] = useState<File | null>(null);
  const [selectedNodeUrl, setSelectedNodeUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  React.useEffect(() => {
    const firstOnline = nodes.find(n => n.isOnline);
    if (firstOnline && !selectedNodeUrl) {
        setSelectedNodeUrl(firstOnline.url);
    } else if (nodes.length > 0 && !selectedNodeUrl) {
        setSelectedNodeUrl(nodes[0].url);
    }
  }, [nodes]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setLogs([]); 
    }
  };

  const handleProcess = async () => {
    if (!file || !selectedNodeUrl) return;

    setIsProcessing(true);
    addLog(`Starting upload of ${file.name} to ${selectedNodeUrl}...`);

    try {
      const job = await uploadBook(selectedNodeUrl, file);
      addLog(`✅ Job created successfully! ID: ${job.id}`);
      addLog(`Status: ${job.status}`);
      
      onUploadSuccess();
    } catch (err) {
      addLog(`❌ Upload failed: ${err}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Orchestrate Synthesis">
        <div className="flex flex-col gap-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
            <input
              id="file-upload"
              type="file"
              accept=".txt,.pdf,.epub,.md"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {file ? file.name : "Select Book (PDF, EPUB, TXT)"}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Fog Node</label>
            <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                value={selectedNodeUrl}
                onChange={(e) => setSelectedNodeUrl(e.target.value)}
                disabled={isProcessing}
            >
                <option value="" disabled>Select a node...</option>
                {nodes.map(node => (
                    <option key={node.id} value={node.url}>
                        {node.url} {node.isOnline ? '(Online)' : '(Offline)'}
                    </option>
                ))}
            </select>
            {nodes.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No nodes available. Add one in the Fog Nodes page.</p>
            )}
          </div>

          <Button
            onClick={handleProcess}
            disabled={!file || !selectedNodeUrl || isProcessing}
            isLoading={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Start Fog Synthesis"}
          </Button>
        </div>
      </Card>
      
      {logs.length > 0 && (
        <Card title="Orchestrator Logs" className="bg-gray-900 text-gray-200 font-mono text-xs">
            <div className="max-h-60 overflow-y-auto space-y-1 p-2">
                {logs.map((log, i) => (
                    <div key={i} className="border-l-2 border-indigo-500 pl-2">{log}</div>
                ))}
            </div>
        </Card>
      )}
    </div>
  );
}
