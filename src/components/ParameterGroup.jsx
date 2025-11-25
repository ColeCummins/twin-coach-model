
import React from 'react';
import Tooltip from './Tooltip';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

export const ParameterGroup = ({ title, children, isOpen, onToggle }) => (
  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white mb-4 shadow-sm">
    <div className="bg-slate-50 p-3 cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors" onClick={onToggle}>
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</h4>
      <span className="text-slate-400">{isOpen ? <FiChevronDown /> : <FiChevronRight />}</span>
    </div>
    {isOpen && <div className="p-4 space-y-5 bg-white">{children}</div>}
  </div>
);

export const InputField = ({ label, id, value, type="number", onChange, tooltip, prefix, suffix, step=1, min, max, readOnly=false }) => (
  <div className="relative">
    <div className="flex items-center mb-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Tooltip text={tooltip} />
    </div>
    <div className="flex items-center">
      {prefix && <span className="absolute left-3 text-slate-400 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        step={step}
        min={min}
        max={max}
        readOnly={readOnly}
        onChange={(e) => !readOnly && onChange(id, parseFloat(e.target.value) || 0)}
        className={`w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-8' : ''} ${readOnly ? 'bg-slate-100' : ''}`}
      />
      {suffix && <span className="absolute right-3 text-slate-400 text-sm">{suffix}</span>}
    </div>
  </div>
);

export const Toggle = ({ label, checked, onChange, tooltip, danger }) => (
    <label className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className={`mt-1 w-5 h-5 rounded ${danger ? 'text-red-600' : 'text-blue-600'}`} />
      <div className="flex-1">
        <div className="flex items-center">
            <span className={`text-sm font-medium ${danger ? 'text-red-700' : 'text-slate-700'}`}>{label}</span>
            <Tooltip text={tooltip} />
        </div>
      </div>
    </label>
);
