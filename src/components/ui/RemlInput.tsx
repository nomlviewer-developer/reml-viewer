'use client';

import { useState, useCallback, useEffect, DragEvent, ChangeEvent } from 'react';

interface RemlInputProps {
  onYamlChange: (yaml: string) => void;
  value?: string;
}

export function RemlInput({ onYamlChange, value = '' }: RemlInputProps) {
  const [yamlText, setYamlText] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');

  // Sync internal state when external value changes
  useEffect(() => {
    setYamlText(value);
  }, [value]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setYamlText(value);
    onYamlChange(value);
  };

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setYamlText(content);
        onYamlChange(content);
      };
      reader.readAsText(file);
    },
    [onYamlChange]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.yaml') || file.name.endsWith('.yml'))) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'paste'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
          }`}
          onClick={() => setActiveTab('paste')}
        >
          Paste YAML
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          Upload File
        </button>
      </div>

      {/* Paste Tab */}
      {activeTab === 'paste' && (
        <textarea
          className="w-full h-64 p-4 font-mono text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
          placeholder="Paste your REML (YAML) here..."
          value={yamlText}
          onChange={handleTextChange}
        />
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div
          className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <svg
            className="w-12 h-12 text-zinc-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-zinc-600 dark:text-zinc-400 mb-2">Drag & drop a YAML file here</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-4">or</p>
          <label className="px-4 py-2 bg-emerald-500 text-white rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors">
            Choose File
            <input type="file" accept=".yaml,.yml" className="hidden" onChange={handleFileInput} />
          </label>
        </div>
      )}

      {/* Show loaded content preview in upload mode */}
      {activeTab === 'upload' && yamlText && (
        <div className="mt-4">
          <p className="text-sm text-zinc-500 mb-2">Loaded content:</p>
          <pre className="w-full h-32 p-4 font-mono text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-auto">
            {yamlText}
          </pre>
        </div>
      )}
    </div>
  );
}
