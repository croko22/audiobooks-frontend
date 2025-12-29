import React, { useEffect, useState } from "react";
import { fetchJobs, deleteJob, type Job } from "~/utils/api";
import { Card } from "~/components/ui/Card";
import { ConfirmModal } from "~/components/ui/ConfirmModal";
import { AudioPlayer } from "~/components/ui/AudioPlayer";

import { useNodes } from "~/contexts/NodeContext";

export function JobDashboard() {
  const { nodes, selectedNodeUrl } = useNodes();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingJob, setPlayingJob] = useState<Job | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; job: Job | null }>({
    isOpen: false,
    job: null,
  });

  const loadJobs = async () => {
    try {
      // Si hay un fog node seleccionado, mostrar solo sus jobs
      if (selectedNodeUrl) {
        const selectedNode = nodes.find(n => n.url === selectedNodeUrl);
        if (selectedNode && selectedNode.isOnline) {
          const nodeJobs = await fetchJobs(selectedNode.url);
          const jobsWithNodeUrl = nodeJobs.map(job => ({ ...job, nodeUrl: selectedNode.url }));
          setJobs(
            jobsWithNodeUrl.sort(
              (a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            )
          );
          setLoading(false);
          return;
        } else {
          // Si el nodo seleccionado no está online, mostrar vacío
          setJobs([]);
          setLoading(false);
          return;
        }
      }

      // Si no hay nodo seleccionado, mostrar jobs de todos los nodos online
      const onlineNodes = nodes.filter(n => n.isOnline);
      if (onlineNodes.length === 0) {
          setJobs([]);
          setLoading(false);
          return;
      }
      
      const results = await Promise.all(
          onlineNodes.map(async node => {
            const nodeJobs = await fetchJobs(node.url);
            // Tag each job with its source node URL
            return nodeJobs.map(job => ({ ...job, nodeUrl: node.url }));
          })
      );
      
      // Flatten and deduplicate by ID just in case
      const allJobs = results.flat();
      const uniqueJobs = Array.from(new Map(allJobs.map(job => [job.id, job])).values());

      setJobs(
        uniqueJobs.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (job: Job) => {
    if (!job.output_files || job.output_files.length === 0) {
      console.error("No audio files available");
      return;
    }

    // Si ya está reproduciendo este job, cerrar el reproductor
    if (playingJob?.id === job.id) {
      setPlayingJob(null);
      return;
    }

    // Abrir el reproductor con este job
    setPlayingJob(job);
  };

  const handleDownload = (job: Job) => {
    if (!job.output_files || job.output_files.length === 0) return;
    
    // Fog Computing: Use GCS public URL directly
    // Fallback: if it's a local path, construct URL from nodeUrl
    let audioUrl = job.output_files[0];
    
    // If it's a local path (not a full URL), construct from nodeUrl
    if (!audioUrl.startsWith("http") && !audioUrl.startsWith("gs://")) {
      const filename = audioUrl.replace("generated_audio/", "");
      audioUrl = job.nodeUrl ? `${job.nodeUrl}/audio/${filename}` : audioUrl;
    }
    
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${job.filename.replace(/\.[^.]+$/, "")}.wav`;
    link.click();
  };

  const handleDelete = (job: Job) => {
    if (!job.nodeUrl) return;
    setDeleteModal({ isOpen: true, job });
  };

  const confirmDelete = async () => {
    const job = deleteModal.job;
    if (!job || !job.nodeUrl) return;
    
    try {
      await deleteJob(job.nodeUrl, job.id);
      // Remove from local state immediately
      setJobs(prev => prev.filter(j => j.id !== job.id));
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setDeleteModal({ isOpen: false, job: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, job: null });
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 2000);
    return () => clearInterval(interval);
  }, [nodes, selectedNodeUrl]);

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "queued":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1">
        Your Library
      </h2>
      
      {jobs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No books processed yet. Upload one to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="transition-all hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/50">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-4">
                      {job.filename}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{job.message || `${job.progress}% processed`}</span>
                      <span>{job.created_at ? new Date(job.created_at).toLocaleTimeString() : ""}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          job.status === "failed" ? "bg-red-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {job.status === "completed" && (
                  <div className="flex items-center gap-2 md:pl-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0">
                   <button 
                    onClick={() => handlePlay(job)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition w-full md:w-auto justify-center ${
                      playingJob?.id === job.id 
                        ? "bg-indigo-600 hover:bg-indigo-700" 
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                   >
                    {playingJob?.id === job.id ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Playing
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Play
                      </>
                    )}
                   </button>
                    <button 
                      onClick={() => handleDownload(job)}
                      className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      title="Download audio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(job)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {job.status !== "completed" && (
                  <div className="flex items-center gap-2 md:pl-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0">
                    <button 
                      onClick={() => handleDelete(job)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Eliminar audiobook"
        message={`¿Estás seguro de que deseas eliminar "${deleteModal.job?.filename}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, job: null })}
      />

      {/* Audio Player - Spotify Style */}
      {playingJob && (
        <AudioPlayer 
          job={playingJob} 
          onClose={() => setPlayingJob(null)} 
        />
      )}
    </div>
  );
}
