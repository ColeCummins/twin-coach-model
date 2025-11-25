
import React from 'react';
import { FiInfo } from 'react-icons/fi';

export default function Tooltip({ text }) {
  if (!text) return null;
  return (
    <div className="group relative inline-block ml-2 align-middle z-50">
      <FiInfo className="w-4 h-4 text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
      <div className="tooltip-content opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-xl z-50 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}
