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
  selectedNodeUrl: string | null;
  setSelectedNodeUrl: (url: string | null) => void;
}

const NodeContext = createContext<NodeContextType | undefined>(undefined);

const STORAGE_KEY = "fognode_nodes";

const SELECTED_NODE_KEY = "fognode_selected_node";

export function NodeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<FogNode[]>(() => {
    // Cargar desde localStorage o usar los defaults
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading nodes from localStorage:", e);
    }
    
    // Si no hay nada guardado, usar los defaults
    return config.defaultFogNodes.map((url: string) => ({
      id: crypto.randomUUID(),
      url,
      isOnline: false,
    }));
  });

  const [selectedNodeUrl, setSelectedNodeUrlState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SELECTED_NODE_KEY);
    } catch (e) {
      return null;
    }
  });

  const setSelectedNodeUrl = (url: string | null) => {
    setSelectedNodeUrlState(url);
    if (url) {
      localStorage.setItem(SELECTED_NODE_KEY, url);
    } else {
      localStorage.removeItem(SELECTED_NODE_KEY);
    }
  };

  // Guardar en localStorage cada vez que cambien los nodes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    } catch (e) {
      console.error("Error saving nodes to localStorage:", e);
    }
  }, [nodes]);

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
    setNodes(prev => {
      // Actualizar en paralelo sin bloquear
      Promise.all(prev.map(checkNodeHealth)).then(updatedNodes => {
        setNodes(updatedNodes);
      });
      return prev; // Retornar estado actual mientras se actualiza
    });
  };

  const addNode = (url: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `http://${formattedUrl}`;
    }
    formattedUrl = formattedUrl.replace(/\/$/, "");

    setNodes(prev => {
      if (prev.some(n => n.url === formattedUrl)) return prev;
      
      const newNode: FogNode = {
        id: crypto.randomUUID(),
        url: formattedUrl,
        isOnline: false
      };
      
      checkNodeHealth(newNode).then(checkedNode => {
        setNodes(current => current.map(n => n.id === checkedNode.id ? checkedNode : n));
      });
      
      return [...prev, newNode];
    });
  };

  const removeNode = (id: string) => {
    setNodes(prev => {
      const removedNode = prev.find(n => n.id === id);
      const filtered = prev.filter(n => n.id !== id);
      // Si se eliminó el nodo seleccionado, limpiar la selección
      if (removedNode && selectedNodeUrl === removedNode.url) {
        setSelectedNodeUrl(null);
      }
      return filtered;
    });
  };

  useEffect(() => {
    // Refrescar estado online al montar
    refreshNodes();
  }, []); // Solo ejecutar una vez al montar

  return (
    <NodeContext.Provider value={{ nodes, addNode, removeNode, refreshNodes, selectedNodeUrl, setSelectedNodeUrl }}>
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
