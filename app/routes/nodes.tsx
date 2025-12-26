import React, { useState } from "react";
import { useNodes } from "~/contexts/NodeContext";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";

// Temporary any type until typegen runs
export function meta({}: any) {
  return [{ title: "Fog Nodes | Audiobooks" }];
}

export default function NodesPage() {
  const { nodes, addNode, removeNode, refreshNodes } = useNodes();
  const [newNodeUrl, setNewNodeUrl] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNodeUrl) {
      addNode(newNodeUrl);
      setNewNodeUrl("");
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-600">Fog Nodes</h1>
                <p className="text-gray-500 mt-1">Manage your distributed audio synthesis workers.</p>
            </div>
            <Button variant="secondary" onClick={() => refreshNodes()}>
                Check Status
            </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Node Form */}
            <Card title="Add New Node" className="h-fit">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Node URL
                        </label>
                        <input 
                            id="url"
                            type="text" 
                            placeholder="http://192.168.1.100:8000"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all"
                            value={newNodeUrl}
                            onChange={(e) => setNewNodeUrl(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Add Node
                    </Button>
                </form>
            </Card>

            {/* Nodes List */}
            <div className="space-y-4">
                {nodes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white/50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        No nodes configured. Add one to get started.
                    </div>
                ) : (
                    nodes.map(node => (
                        <Card key={node.id} className="group relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-mono text-sm text-gray-400 mb-1">ID: {node.id.split('-')[0]}</h3>
                                    <div className="font-medium text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        {node.url}
                                        <a href={`${node.url}/openapi.json`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 hover:text-indigo-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${node.isOnline ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                                        <span className={`relative flex h-2.5 w-2.5`}>
                                          {node.isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${node.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        </span>
                                        {node.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                    <button 
                                        onClick={() => removeNode(node.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        title="Remove Node"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
