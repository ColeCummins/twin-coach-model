
import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';

export default function Tooltip({ text }) {
  if (!text) return null;
  return (
    <div className="group relative inline-block ml-2 align-middle z-50">
      <FiHelpCircle className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help" />
      <div className="tooltip-content hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
}
