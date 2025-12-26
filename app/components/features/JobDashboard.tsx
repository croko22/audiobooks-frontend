import React, { useEffect, useState } from "react";
import { fetchJobs, type Job } from "~/utils/api";
import { Card } from "~/components/ui/Card";

import { useNodes } from "~/contexts/NodeContext";

export function JobDashboard() {
  const { nodes } = useNodes();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const onlineNodes = nodes.filter(n => n.isOnline);
      if (onlineNodes.length === 0) {
          setJobs([]);
          return;
      }
      
      const results = await Promise.all(
          onlineNodes.map(node => fetchJobs(node.url))
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

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 2000);
    return () => clearInterval(interval);
  }, []);

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
                      <span>{new Date(job.created_at).toLocaleTimeString()}</span>
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
                   <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition w-full md:w-auto justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play
                   </button>
                    <button className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
