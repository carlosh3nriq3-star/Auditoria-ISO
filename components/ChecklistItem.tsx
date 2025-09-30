import React, { useRef } from 'react';
import type { ChecklistItemData } from '../types';
import { Status } from '../types';
import { StatusSelector } from './StatusSelector';
import { LoadingSpinner } from './LoadingSpinner';

interface ChecklistItemProps {
  item: ChecklistItemData;
  onStatusChange: (newStatus: Status) => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const ObservationDisplay: React.FC<{ observation: ChecklistItemData['observations'] }> = ({ observation }) => {
  if (!observation) {
    return <span className="text-slate-400">Selecione um status para gerar as observações...</span>;
  }

  let data;
  if (typeof observation === 'object' && observation !== null) {
    data = observation;
  } else { // It's a string
    try {
      data = JSON.parse(String(observation));
    } catch (error) {
      // If parsing fails, it's a plain text message
      return <p className="whitespace-pre-wrap text-slate-700">{String(observation)}</p>;
    }
  }

  const { fact, evidence, requirement, justification } = data;

  if (justification) {
    return <p className="whitespace-pre-wrap text-slate-700">{justification}</p>;
  }

  if (fact || evidence || requirement) {
    return (
      <div className="space-y-3">
        {fact && (
          <div>
            <strong className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fato</strong>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{fact}</p>
          </div>
        )}
        {evidence && (
          <div>
            <strong className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evidência</strong>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{evidence}</p>
          </div>
        )}
        {requirement && (
          <div>
            <strong className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requisito</strong>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{requirement}</p>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback for empty JSON object or other edge cases
  return <p className="whitespace-pre-wrap text-slate-700">{JSON.stringify(observation)}</p>;
};

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onStatusChange, onImageUpload, isLoading }) => {
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

  const isGenerating = isLoading && typeof item.observations === 'string' && item.observations.includes('Gerando');

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
                        />
                    </div>

                    <div className="flex-1 min-w-[250px]">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-medium text-slate-600">Observações / Evidências</h4>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button onClick={handleUploadClick} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-1 px-2.5 rounded-md transition flex items-center gap-1.5">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                               Anexar Imagem
                            </button>
                        </div>
                        <div className="flex items-start text-sm min-h-[6rem] bg-slate-50 rounded-lg p-3 border border-slate-200">
                            {isGenerating && <LoadingSpinner />}
                            <div className={`flex-1 ${isGenerating ? 'text-slate-400' : ''}`}>
                                <ObservationDisplay observation={item.observations} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
