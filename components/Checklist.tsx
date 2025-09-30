import React from 'react';
import type { IsoStandard } from '../types';
import { Status } from '../types';
import { ChecklistItem } from './ChecklistItem';

interface ChecklistProps {
  standard: IsoStandard;
  onStatusChange: (itemId: string, newStatus: Status) => void;
  onImageUpload: (itemId: string, standardId: string, file: File) => void;
  loadingItemId: string | null;
}

export const Checklist: React.FC<ChecklistProps> = ({ standard, onStatusChange, onImageUpload, loadingItemId }) => {
  return (
    <div className="space-y-4">
      {standard.items.map((item) => (
        <ChecklistItem 
          key={item.id}
          item={item}
          onStatusChange={(newStatus) => onStatusChange(item.id, newStatus)}
          onImageUpload={(file) => onImageUpload(item.id, standard.id, file)}
          isLoading={loadingItemId === item.id}
        />
      ))}
    </div>
  );
};
