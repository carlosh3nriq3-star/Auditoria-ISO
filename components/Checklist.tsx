
import React from 'react';
import type { IsoStandard } from '../types';
import { Status } from '../types';
import { ChecklistItem } from './ChecklistItem';

interface ChecklistProps {
  standard: IsoStandard;
  onStatusChange: (itemId: string, newStatus: Status) => void;
  onObservationChange: (itemId: string, value: string) => void;
  onImageUpload: (itemId: string, standardId: string, file: File) => void;
  generatingItems: Set<string>;
  canEdit: boolean;
}

export const Checklist: React.FC<ChecklistProps> = ({ standard, onStatusChange, onObservationChange, onImageUpload, generatingItems, canEdit }) => {
  return (
    <div className="space-y-4">
      {standard.items.map((item) => (
        <ChecklistItem 
          key={item.id}
          item={item}
          onStatusChange={(newStatus) => onStatusChange(item.id, newStatus)}
          onObservationChange={(value) => onObservationChange(item.id, value)}
          onImageUpload={(file) => onImageUpload(item.id, standard.id, file)}
          isGenerating={generatingItems.has(item.id)}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};
