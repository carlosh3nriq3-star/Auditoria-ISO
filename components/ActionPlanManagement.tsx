import React, { useMemo, useState } from 'react';
import type { IsoStandard, ChecklistItemData, ActionPlanStatus } from '../types';
import { Status } from '../types';

interface ActionPlanManagementProps {
    standards: IsoStandard[];
    onStatusChange: (itemId: string, standardId: string, newStatus: ActionPlanStatus) => void;
}

const statusColors: { [key in ActionPlanStatus]: string } = {
    'Pendente': 'bg-red-100 text-red-800',
    'Em Andamento': 'bg-yellow-100 text-yellow-800',
    'Concluído': 'bg-green-100 text-green-800',
};

const ActionPlanItem: React.FC<{ item: ChecklistItemData & { standardId: string; standardName: string }, onStatusChange: ActionPlanManagementProps['onStatusChange'] }> = ({ item, onStatusChange }) => {
    const currentActionPlanStatus = item.actionPlanStatus ?? 'Pendente';
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold bg-slate-100 text-slate-700 py-1 px-3 rounded-full">{item.standardName}</span>
                        <span className="text-sm font-semibold bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Req. {item.requirement}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
                <div className="flex-shrink-0">
                     <select
                        value={currentActionPlanStatus}
                        onChange={(e) => onStatusChange(item.id, item.standardId, e.target.value as ActionPlanStatus)}
                        className={`text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-offset-1 transition py-1.5 pl-3 pr-8 appearance-none ${statusColors[currentActionPlanStatus]}`}
                    >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                <div>
                    <strong className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observação (FER)</strong>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{item.observations}</p>
                </div>
                {item.analysis && (
                    <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                        <strong className="text-xs font-bold text-blue-600 uppercase tracking-wider">Análise IA & Ações Sugeridas</strong>
                        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                            <strong>Causa Raiz:</strong> {item.analysis.rootCause}
                        </p>
                        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                            <strong>Ações Corretivas:</strong> {item.analysis.correctiveActions}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}


export const ActionPlanManagement: React.FC<ActionPlanManagementProps> = ({ standards, onStatusChange }) => {
    const [statusFilter, setStatusFilter] = useState<ActionPlanStatus | 'all'>('all');

    const nonConformities = useMemo(() => {
        return standards.flatMap(s => 
            s.items
             .filter(i => i.status === Status.NaoConforme)
             .map(i => ({...i, standardId: s.id, standardName: s.name}))
        ).sort((a, b) => a.requirement.localeCompare(b.requirement));
    }, [standards]);

    const filteredItems = useMemo(() => {
        if (statusFilter === 'all') {
            return nonConformities;
        }
        return nonConformities.filter(item => (item.actionPlanStatus ?? 'Pendente') === statusFilter);
    }, [nonConformities, statusFilter]);
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Planos de Ação</h1>
                <p className="text-sm text-slate-500 font-normal mt-1">
                    Acompanhe e gerencie todas as não conformidades e suas ações corretivas.
                </p>
            </div>
            
             {/* Filter Section */}
            <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 mr-2">Filtrar por Status:</span>
                <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Todos</button>
                {(Object.keys(statusColors) as ActionPlanStatus[]).map(status => (
                     <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>{status}</button>
                ))}
            </div>

            <div className="space-y-6">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <ActionPlanItem key={item.id} item={item} onStatusChange={onStatusChange} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-green-500 mx-auto mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-slate-700">Tudo Certo!</h2>
                        <p className="text-slate-500 mt-2">Nenhuma não conformidade encontrada com os filtros selecionados.</p>
                    </div>
                )}
            </div>

        </div>
    );
};