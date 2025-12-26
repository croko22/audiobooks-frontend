import axios from "axios";

export interface Job {
  id: string;
  filename: string;
  status: "queued" | "processing" | "completed" | "failed";
  created_at?: string;
  message?: string;
  total_chunks?: number;
  processed_chunks?: number;
  output_files?: string[];
  progress?: number;
  nodeUrl?: string; // Added by frontend to track source node
}

export async function uploadBook(nodeUrl: string, file: File): Promise<Job> {
  const baseUrl = nodeUrl.replace(/\/$/, "");
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await axios.post(`${baseUrl}/api/v1/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function fetchJobs(nodeUrl: string): Promise<Job[]> {
  const baseUrl = nodeUrl.replace(/\/$/, "");
  try {
    const res = await axios.get(`${baseUrl}/api/v1/jobs`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch jobs from ${nodeUrl}`, error);
    return [];
  }
}

export async function getJob(nodeUrl: string, jobId: string): Promise<Job> {
  const baseUrl = nodeUrl.replace(/\/$/, "");
  const res = await axios.get(`${baseUrl}/api/v1/jobs/${jobId}`);
  return res.data;
}

export async function deleteJob(nodeUrl: string, jobId: string): Promise<void> {
  const baseUrl = nodeUrl.replace(/\/$/, "");
  await axios.delete(`${baseUrl}/api/v1/jobs/${jobId}`);
}
