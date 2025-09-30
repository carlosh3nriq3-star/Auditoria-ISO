import React from 'react';
import { Status } from '../types';

interface StatusSelectorProps {
  selectedStatus: Status;
  onChange: (newStatus: Status) => void;
  disabled?: boolean;
}

const baseButtonClasses: { [key in Status]: string } = {
  [Status.Conforme]: 'bg-green-100 text-green-800 hover:bg-green-200',
  [Status.NaoConforme]: 'bg-red-100 text-red-800 hover:bg-red-200',
  [Status.NaoAplicavel]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  [Status.NaoAuditado]: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
};

const activeButtonClasses: { [key in Status]: string } = {
  [Status.Conforme]: 'bg-green-600 text-white ring-2 ring-offset-1 ring-green-600',
  [Status.NaoConforme]: 'bg-red-600 text-white ring-2 ring-offset-1 ring-red-600',
  [Status.NaoAplicavel]: 'bg-yellow-500 text-white ring-2 ring-offset-1 ring-yellow-500',
  [Status.NaoAuditado]: 'bg-slate-600 text-white ring-2 ring-offset-1 ring-slate-600',
};


export const StatusSelector: React.FC<StatusSelectorProps> = ({ selectedStatus, onChange, disabled = false }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.values(Status)).map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          disabled={disabled}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed
            ${selectedStatus === status 
              ? activeButtonClasses[status]
              : baseButtonClasses[status]
            }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
};
