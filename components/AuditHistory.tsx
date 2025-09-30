import React from 'react';
import type { CompletedAudit } from '../types';

interface AuditHistoryProps {
  audits: CompletedAudit[];
  onViewAudit: (id: string) => void;
  filters: { company: string; startDate: string; endDate: string };
  onFilterChange: React.Dispatch<React.SetStateAction<{ company: string; startDate: string; endDate: string }>>;
}

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
  </svg>
);

const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 12h6m-6 5.25h6M5.25 6h.008v.008H5.25V6Zm.75 0h.008v.008H6V6Zm.75 0h.008v.008H6.75V6Zm.75 0h.008v.008H7.5V6Zm.75 0h.008v.008H8.25V6Zm5.25 0h.008v.008h-.008V6Zm.75 0h.008v.008h-.008V6Zm.75 0h.008v.008h-.008V6Zm.75 0h.008v.008h-.008V6Zm.75 0h.008v.008h-.008V6Z" />
  </svg>
);

const NoResultsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);


export const AuditHistory: React.FC<AuditHistoryProps> = ({ audits, onViewAudit, filters, onFilterChange }) => {
    
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    onFilterChange({
        company: '',
        startDate: '',
        endDate: '',
    });
  };

  const filtersAreActive = filters.company || filters.startDate || filters.endDate;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Histórico de Auditorias</h1>
        <p className="text-sm text-slate-500 font-normal mt-1">
          Consulte e filtre os relatórios de todas as auditorias finalizadas.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                <div className="sm:col-span-1">
                    <label htmlFor="company-filter" className="block text-sm font-medium text-slate-700">Empresa</label>
                    <input type="text" id="company-filter" name="company" value={filters.company} onChange={handleChange} placeholder="Nome da empresa..." className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition"/>
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="start-date-filter" className="block text-sm font-medium text-slate-700">De</label>
                    <input type="date" id="start-date-filter" name="startDate" value={filters.startDate} onChange={handleChange} className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition"/>
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="end-date-filter" className="block text-sm font-medium text-slate-700">Até</label>
                    <input type="date" id="end-date-filter" name="endDate" value={filters.endDate} onChange={handleChange} className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition"/>
                </div>
            </div>
            <div className="flex-shrink-0">
                <button
                    onClick={handleClearFilters}
                    className="w-full md:w-auto bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition shadow-sm text-sm"
                >
                    Limpar Filtros
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
        {audits.length > 0 ? (
          <div className="space-y-4">
            {audits.sort((a, b) => parseInt(b.id) - parseInt(a.id)).map(audit => (
              <div key={audit.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
                        <strong>Data de Finalização:</strong>
                        <span>{audit.completionDate}</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                        <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                        <strong>Empresa:</strong>
                        <span>{audit.auditInfo.company}</span>
                    </div>
                </div>
                <div>
                    <div className="text-sm font-medium text-slate-500">Conformidade</div>
                    <div className="text-xl font-bold text-green-600">{audit.summary.compliancePercentage.toFixed(1)}%</div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => onViewAudit(audit.id)}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <NoResultsIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">
              {filtersAreActive ? 'Nenhum resultado encontrado' : 'Nenhuma auditoria arquivada'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {filtersAreActive 
                ? 'Tente ajustar ou limpar seus filtros de busca.' 
                : 'Quando você finalizar uma auditoria, ela aparecerá aqui.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};