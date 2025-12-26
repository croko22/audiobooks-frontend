import type { Route } from "./+types/home";
import { UploadForm } from "~/components/features/UploadForm";
import { JobDashboard } from "~/components/features/JobDashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FogNode Audiobooks" },
    { name: "description", content: "Convert your books to audio locally." },
  ];
}

export default function Home() {
  const handleUploadSuccess = () => {
    // In a more complex app, we might trigger a refresh here.
    // For now, the dashboard polls every 2s, so it will appear shortly.
    console.log("Upload successful, waiting for polling...");
  };

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload */}
          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-24">
              <UploadForm onUploadSuccess={handleUploadSuccess} />
              
              <div className="mt-8 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How it works
                </h4>
                <ul className="text-sm text-indigo-800 dark:text-indigo-200/80 space-y-2 pl-1">
                  <li className="flex gap-2">
                    <span className="font-bold opacity-50">1.</span> Upload a text file (e.g., .txt or .epub).
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold opacity-50">2.</span> The server splits it into chunks.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold opacity-50">3.</span> AI generates audio for each chunk.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold opacity-50">4.</span> Download the final audiobook!
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-2">
            <JobDashboard />
          </div>
        </div>
      </main>
    </>
  );
}
