
import React, { useState } from 'react';
import type { AuditInfo, IsoStandard } from '../types';
import { Status } from '../types';

interface ReportGeneratorProps {
  auditInfo: AuditInfo;
  standards: IsoStandard[];
}

const PrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0-1.423-.239a25.267 25.267 0 0 0-1.172-2.132L12 2.25l-1.423 4.689a25.267 25.267 0 0 0-1.172 2.132L7.95 7.282M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
    </svg>
);

const statusColors: { [key in Status]: { text: string; bg: string; border: string; } } = {
  [Status.Conforme]: { text: 'text-green-800', bg: 'bg-green-50', border: 'border-green-200' },
  [Status.NaoConforme]: { text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200' },
  [Status.NaoAplicavel]: { text: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  [Status.NaoAuditado]: { text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};


export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ auditInfo, standards }) => {
  const [selectedStandards, setSelectedStandards] = useState<string[]>(standards.map(s => s.id));

  const handlePrint = () => {
    window.print();
  };
  
  const toggleStandard = (standardId: string) => {
    setSelectedStandards(prev =>
      prev.includes(standardId)
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    );
  };

  const filteredStandards = standards.filter(s => selectedStandards.includes(s.id));
  const allItems = filteredStandards.flatMap(s => s.items);
  const nonConformities = allItems.filter(item => item.status === Status.NaoConforme);
  const conformities = allItems.filter(item => item.status === Status.Conforme);
  const totalAudited = allItems.filter(item => item.status !== Status.NaoAuditado && item.status !== Status.NaoAplicavel).length;
  const compliance = totalAudited > 0 ? (conformities.length / totalAudited) * 100 : 0;

  const ReportSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <section className="mb-10 break-after-page">
      <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">{title}</h2>
      {children}
    </section>
  );

  return (
    <div id="report-container" className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg">
      <header className="flex flex-col gap-6 mb-8 pb-4 border-b border-slate-200 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gerador de Relatório</h1>
                <p className="text-sm text-slate-500 mt-1">Selecione as normas e exporte o documento consolidado.</p>
            </div>
             <div className="text-left md:text-right w-full md:w-auto">
                <button
                onClick={handlePrint}
                disabled={selectedStandards.length === 0}
                className="w-full justify-center md:w-auto bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                <PrintIcon className="w-5 h-5" />
                Exportar para PDF
                </button>
                <p className="text-xs text-slate-400 mt-1 no-print">Utiliza a função de impressão para salvar como PDF.</p>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-sm font-medium text-slate-700 flex-shrink-0">Incluir no Relatório:</span>
            <div className="flex flex-wrap gap-2">
                {standards.map(standard => (
                <button
                    key={standard.id}
                    onClick={() => toggleStandard(standard.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${selectedStandards.includes(standard.id)
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                    {standard.name}
                </button>
                ))}
            </div>
        </div>
      </header>

      <article id="report-content" className="prose max-w-none prose-slate">
        {selectedStandards.length > 0 ? (
            <>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-2">Relatório Final de Auditoria Interna</h1>
                    <p className="text-lg text-slate-600">{auditInfo.company}</p>
                </div>

                <ReportSection title="1. Informações da Auditoria">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    <div><strong>Empresa:</strong> {auditInfo.company}</div>
                    <div><strong>Departamento/Área Auditada:</strong> {auditInfo.department}</div>
                    <div><strong>Auditor Líder:</strong> {auditInfo.leadAuditor}</div>
                    <div><strong>Auditores Internos:</strong> {auditInfo.internalAuditors}</div>
                    <div><strong>Auditados:</strong> {auditInfo.auditees}</div>
                    <div><strong>Data da Auditoria:</strong> {auditInfo.auditDate}</div>
                </div>
                </ReportSection>

                <ReportSection title="2. Sumário Executivo">
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Total de Itens Verificados:</strong> {allItems.length}</li>
                    <li><strong>Total de Itens Auditados:</strong> {totalAudited}</li>
                    <li><strong>Não Conformidades Encontradas:</strong> <span className="font-bold text-red-600">{nonConformities.length}</span></li>
                    <li><strong>Taxa de Conformidade (sobre itens auditados):</strong> <span className="font-bold text-green-600">{compliance.toFixed(1)}%</span></li>
                </ul>
                </ReportSection>
                
                <ReportSection title="3. Checklist da Auditoria">
                <div className="space-y-8">
                    {filteredStandards.map(standard => (
                    <div key={standard.id} className="break-inside-avoid">
                        <h3 className="text-xl font-semibold mb-4 text-slate-700 bg-slate-100 p-2 rounded">{standard.name}</h3>
                        <div className="space-y-6">
                        {standard.items.map(item => (
                            <div key={item.id} className="p-4 border border-slate-200 rounded-lg break-inside-avoid">
                            <div className="flex justify-between items-start">
                                <div>
                                <h4 className="font-bold text-lg">Requisito {item.requirement}</h4>
                                <p className="italic text-slate-600 mb-2">{item.description}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColors[item.status].bg} ${statusColors[item.status].text}`}>
                                {item.status}
                                </span>
                            </div>
                            <div className={`mt-2 p-3 rounded border ${statusColors[item.status].bg} ${statusColors[item.status].border}`}>
                                <p className="font-semibold">Observações e Evidências:</p>
                                <p className="whitespace-pre-wrap">{item.observations || 'Nenhuma observação registrada.'}</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    ))}
                </div>
                </ReportSection>

                <section className="mt-20 pt-10 border-t border-slate-300">
                    <h2 className="text-2xl font-bold text-slate-800 mb-12 text-center">4. Assinaturas</h2>
                    <div className="flex justify-around items-center text-center">
                        <div className="w-2/5">
                            <div className="border-t-2 border-slate-400 pt-2">{auditInfo.leadAuditor}</div>
                            <div className="text-sm font-semibold">Auditor Líder</div>
                        </div>
                        <div className="w-2/5">
                            <div className="border-t-2 border-slate-400 pt-2">{auditInfo.auditees.split(',')[0]}</div>
                            <div className="text-sm font-semibold">Representante do Auditado</div>
                        </div>
                    </div>
                </section>
            </>
        ) : (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-slate-600">Nenhuma norma selecionada</h2>
                <p className="text-slate-500 mt-2">Por favor, selecione ao menos uma norma para gerar o relatório.</p>
            </div>
        )}
      </article>
    </div>
  );
};