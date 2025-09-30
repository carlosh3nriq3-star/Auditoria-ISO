import React from 'react';
import type { CompletedAudit } from '../types';
import { Checklist } from './Checklist';
import { Status } from '../types';

interface CompletedAuditViewProps {
  audit: CompletedAudit;
  onBack: () => void;
}

const BackArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

const statusColors: { [key in Status]: { text: string; bg: string; } } = {
  [Status.Conforme]: { text: 'text-green-800', bg: 'bg-green-100' },
  [Status.NaoConforme]: { text: 'text-red-800', bg: 'bg-red-100' },
  [Status.NaoAplicavel]: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
  [Status.NaoAuditado]: { text: 'text-slate-600', bg: 'bg-slate-200' },
};

export const CompletedAuditView: React.FC<CompletedAuditViewProps> = ({ audit, onBack }) => {

  const AuditInfoDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-800">{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-white p-2 rounded-full shadow-sm border border-slate-200 hover:bg-slate-100 transition"
          aria-label="Voltar para o histórico"
        >
          <BackArrowIcon className="w-6 h-6 text-slate-700" />
        </button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Detalhes da Auditoria Arquivada</h1>
            <p className="text-sm text-slate-500 font-normal mt-1">
                Auditoria finalizada em {audit.completionDate}.
            </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-4 mb-6">Informações da Auditoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AuditInfoDisplay label="Empresa" value={audit.auditInfo.company} />
            <AuditInfoDisplay label="Departamento/Área" value={audit.auditInfo.department} />
            <AuditInfoDisplay label="Auditor Líder" value={audit.auditInfo.leadAuditor} />
            <AuditInfoDisplay label="Auditores Internos" value={audit.auditInfo.internalAuditors} />
            <AuditInfoDisplay label="Auditados" value={audit.auditInfo.auditees} />
            <AuditInfoDisplay label="Data da Auditoria" value={audit.auditInfo.auditDate} />
        </div>
      </div>

      {audit.standards.map(standard => (
        <div key={standard.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">{standard.name}</h2>
          <Checklist
            standard={standard}
            onStatusChange={() => {}} // No-op
            onObservationChange={() => {}} // No-op
            onImageUpload={() => {}} // No-op
            generatingItems={new Set()}
            canEdit={false} // This makes the component read-only
          />
        </div>
      ))}
    </div>
  );
};
