import React from 'react';
import type { ChecklistItemData } from '../types';

interface RecentNonConformitiesProps {
  items: ChecklistItemData[];
}

export const RecentNonConformities: React.FC<RecentNonConformitiesProps> = ({ items }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Não Conformidades Recentes</h3>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
              <p className="text-sm font-semibold text-slate-800">
                <span className="font-bold text-red-600">[{item.requirement}]</span> {item.description}
              </p>
              <p className="text-xs text-slate-500 mt-1">{item.standardName}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-500 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm text-slate-500">Nenhuma não conformidade encontrada.</p>
            <p className="text-xs text-slate-400">Ótimo trabalho!</p>
        </div>
      )}
    </div>
  );
};