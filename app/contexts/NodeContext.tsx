import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { config } from "~/utils/config";

export interface FogNode {
  id: string;
  url: string;
  isOnline: boolean;
  lastPing?: number;
}

interface NodeContextType {
  nodes: FogNode[];
  addNode: (url: string) => void;
  removeNode: (id: string) => void;
  refreshNodes: () => Promise<void>;
}

const NodeContext = createContext<NodeContextType | undefined>(undefined);

export function NodeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<FogNode[]>(() => {
    return config.defaultFogNodes.map((url: string) => ({
      id: crypto.randomUUID(),
      url,
      isOnline: false,
    }));
  });

  const checkNodeHealth = async (node: FogNode): Promise<FogNode> => {
    try {
      await axios.get(`${node.url}/openapi.json`, { 
        timeout: 2000 
      });
      return { ...node, isOnline: true, lastPing: Date.now() };
    } catch (e) {
      return { ...node, isOnline: false, lastPing: Date.now() };
    }
  };

  const refreshNodes = async () => {
    const updatedNodes = await Promise.all(nodes.map(checkNodeHealth));
    setNodes(updatedNodes);
  };

  const addNode = (url: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `http://${formattedUrl}`;
    }
    formattedUrl = formattedUrl.replace(/\/$/, "");

    if (nodes.some(n => n.url === formattedUrl)) return;

    const newNode: FogNode = {
      id: crypto.randomUUID(),
      url: formattedUrl,
      isOnline: false
    };
    
    setNodes(prev => [...prev, newNode]);
    checkNodeHealth(newNode).then(checkedNode => {
        setNodes(prev => prev.map(n => n.id === checkedNode.id ? checkedNode : n));
    });
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    refreshNodes();
  }, []);

  return (
    <NodeContext.Provider value={{ nodes, addNode, removeNode, refreshNodes }}>
      {children}
    </NodeContext.Provider>
  );
}

export function useNodes() {
  const context = useContext(NodeContext);
  if (context === undefined) {
    throw new Error("useNodes must be used within a NodeProvider");
  }
  return context;
}
