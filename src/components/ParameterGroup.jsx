
import React from 'react';
import { FiChevronDown, FiChevronRight, FiInfo } from 'react-icons/fi';
import Tooltip from './Tooltip';

export const ParameterGroup = ({ title, children, isOpen, onToggle }) => (
  <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800 mb-4 shadow-sm transition-all duration-200">
    <div
        className="bg-slate-800/50 p-4 cursor-pointer flex justify-between items-center hover:bg-slate-700/50 transition-colors group"
        onClick={onToggle}
    >
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">{title}</h4>
      <span className="text-slate-500 group-hover:text-slate-300">{isOpen ? <FiChevronDown /> : <FiChevronRight />}</span>
    </div>
    {isOpen && <div className="p-5 space-y-6 border-t border-slate-700/50">{children}</div>}
  </div>
);

export const InputField = ({ label, id, value, type="number", onChange, tooltip, prefix, suffix, step=1, min, max, readOnly=false }) => (
  <div className="relative group">
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium text-slate-300 group-focus-within:text-indigo-400 transition-colors">{label}</label>
      <Tooltip text={tooltip} />
    </div>
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-slate-500 text-sm font-medium">{prefix}</span>}
      <input
        type={type}
        value={value}
        step={step}
        min={min}
        max={max}
        readOnly={readOnly}
        onChange={(e) => !readOnly && onChange(id, parseFloat(e.target.value) || 0)}
        className={`
            w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg
            focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
            block p-2.5 transition-all duration-200 shadow-inner
            ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}
            ${readOnly ? 'opacity-60 cursor-not-allowed bg-slate-800' : 'hover:border-slate-600'}
        `}
      />
      {suffix && <span className="absolute right-3 text-slate-500 text-sm font-medium">{suffix}</span>}
    </div>
  </div>
);

export const Toggle = ({ label, checked, onChange, tooltip, danger }) => (
    <label className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-transparent hover:bg-slate-700/30 transition-all ${checked ? 'bg-slate-800 border-slate-700' : ''}`}>
      <div className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${danger ? 'peer-checked:bg-rose-600' : 'peer-checked:bg-indigo-600'}`}></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center">
            <span className={`text-sm font-medium ${danger && checked ? 'text-rose-400' : 'text-slate-300'}`}>{label}</span>
            <Tooltip text={tooltip} />
        </div>
      </div>
    </label>
);
