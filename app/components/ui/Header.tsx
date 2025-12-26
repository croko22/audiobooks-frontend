import React from "react";
import { Link, useLocation } from "react-router";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 rounded-lg p-1.5 transition-transform group-hover:scale-110 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            FogNode <span className="text-indigo-600 dark:text-indigo-400">Audiobooks</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${
                isActive("/") 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Library
          </Link>
          <Link 
            to="/nodes" 
            className={`text-sm font-medium transition-colors ${
                isActive("/nodes") 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Fog Nodes
          </Link>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
          
          <a 
            href="https://github.com/google/deepmind" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
