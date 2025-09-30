import React from 'react';
import type { IsoStandard } from '../types';
import { Status } from '../types';
import { ChecklistItem } from './ChecklistItem';

interface ChecklistProps {
  standard: IsoStandard;
  onStatusChange: (itemId: string, newStatus: Status) => void;
  onImageUpload: (itemId: string, standardId: string, file: File) => void;
  onAnalyze: (itemId: string, standardId: string) => void;
  loadingItemId: string | null;
  analyzingItemId: string | null;
}

export const Checklist: React.FC<ChecklistProps> = ({ standard, onStatusChange, onImageUpload, onAnalyze, loadingItemId, analyzingItemId }) => {
  return (
    <div className="space-y-4">
      {standard.items.map((item) => (
        <ChecklistItem 
          key={item.id}
          item={item}
          onStatusChange={(newStatus) => onStatusChange(item.id, newStatus)}
          onImageUpload={(file) => onImageUpload(item.id, standard.id, file)}
          onAnalyze={() => onAnalyze(item.id, standard.id)}
          isLoading={loadingItemId === item.id}
          isAnalyzing={analyzingItemId === item.id}
        />
      ))}
    </div>
  );
};
