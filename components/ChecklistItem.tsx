

import React, { useRef } from 'react';
import type { ChecklistItemData } from '../types';
import { Status } from '../types';
import { StatusSelector } from './StatusSelector';

interface ChecklistItemProps {
  item: ChecklistItemData;
  onStatusChange: (newStatus: Status) => void;
  onObservationChange: (value: string) => void;
  onImageUpload: (file: File) => void;
  isGenerating: boolean;
  canEdit: boolean;
}

const LoadingSpinner: React.FC<{className?: string}> = ({ className = 'w-4 h-4' }) => {
    return (
        <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
};

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onStatusChange, onObservationChange, onImageUpload, isGenerating, canEdit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200/80">
        <div className="grid md:grid-cols-2 md:gap-x-8 gap-y-4">
            {/* Information Column */}
            <div className="space-y-3">
                <div>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full">Requisito</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">{item.requirement}</h3>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-slate-600 mb-1">Descrição</h4>
                    <p className="text-slate-700 text-sm">{item.description}</p>
                </div>
                {item.evidenceImage && (
                    <div className="pt-2">
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Evidência Anexada</h4>
                        <img 
                            src={`data:${item.evidenceImage.mimeType};base64,${item.evidenceImage.data}`} 
                            alt={`Evidência para requisito ${item.requirement}`} 
                            className="rounded-lg border border-slate-200 max-h-48 w-auto"
                        />
                    </div>
                )}
            </div>

            {/* Action and Result Column */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-x-6 gap-y-4 items-start">
                    <div className="flex-shrink-0">
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Status</h4>
                        <StatusSelector
                            selectedStatus={item.status}
                            onChange={(newStatus) => onStatusChange(newStatus)}
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="flex-1 min-w-[250px]">
                        <div className="flex flex-wrap justify-between items-baseline gap-2 mb-1">
                            <h4 className="text-sm font-medium text-slate-600">Observações / Evidências</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={!canEdit}
                                />
                                <button 
                                    onClick={handleUploadClick} 
                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-1 px-2.5 rounded-md transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!canEdit}
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                   Anexar Imagem
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="w-full text-sm bg-slate-50 rounded-lg p-3 border border-slate-200 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm min-h-[6rem] disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                            value={item.observations}
                            onChange={(e) => onObservationChange(e.target.value)}
                            rows={4}
                            placeholder="Digite as observações manualmente ou selecione um status para preenchimento automático."
                            disabled={isGenerating || !canEdit}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};