

import React from 'react';
import { Status } from '../types';

interface RequirementsChartData {
  requirement: string;
  [Status.Conforme]: number;
  [Status.NaoConforme]: number;
  [Status.NaoAplicavel]: number;
}

interface RequirementsChartProps {
  data: RequirementsChartData[];
}

const statusColors: { [key in Status]?: string } = {
  [Status.Conforme]: 'bg-green-500',
  [Status.NaoConforme]: 'bg-red-500',
  [Status.NaoAplicavel]: 'bg-yellow-500',
};

const statusLabels: { [key in Status]?: string } = {
  [Status.Conforme]: 'C',
  [Status.NaoConforme]: 'NC',
  [Status.NaoAplicavel]: 'NA',
};


export const RequirementsChart: React.FC<RequirementsChartProps> = ({ data }) => {
  const chartData = data.filter(d => d[Status.Conforme] > 0 || d[Status.NaoConforme] > 0 || d[Status.NaoAplicavel] > 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Achados por Requisito</h3>
         <div className="flex flex-col items-center justify-center h-48 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            <p className="text-sm text-slate-500">Nenhum item auditado para exibir no gráfico.</p>
            <p className="text-xs text-slate-400">Comece a auditar os itens para ver os resultados aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Achados por Requisito</h3>
      <div className="space-y-4">
        {chartData.map((item) => {
          const total = item[Status.Conforme] + item[Status.NaoConforme] + item[Status.NaoAplicavel];
          const compliantWidth = total > 0 ? (item[Status.Conforme] / total) * 100 : 0;
          const nonCompliantWidth = total > 0 ? (item[Status.NaoConforme] / total) * 100 : 0;
          const notApplicableWidth = total > 0 ? (item[Status.NaoAplicavel] / total) * 100 : 0;
          
          return (
            <div key={item.requirement}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-medium text-slate-700 w-1/4">Req. {item.requirement}</p>
                <div className="text-xs text-slate-500 flex-1 text-right">
                  {item[Status.Conforme] > 0 && <span className="font-semibold text-green-600">{item[Status.Conforme]} {statusLabels[Status.Conforme]}</span>}
                  {item[Status.NaoConforme] > 0 && <span className="ml-2 font-semibold text-red-600">{item[Status.NaoConforme]} {statusLabels[Status.NaoConforme]}</span>}
                  {item[Status.NaoAplicavel] > 0 && <span className="ml-2 font-semibold text-yellow-600">{item[Status.NaoAplicavel]} {statusLabels[Status.NaoAplicavel]}</span>}
                </div>
              </div>
              <div className="flex w-full h-4 bg-slate-200 rounded-full overflow-hidden" title={`Conforme: ${item[Status.Conforme]}, Não Conforme: ${item[Status.NaoConforme]}, Não Aplicável: ${item[Status.NaoAplicavel]}`}>
                {compliantWidth > 0 && <div className={`${statusColors[Status.Conforme]}`} style={{ width: `${compliantWidth}%` }}></div>}
                {nonCompliantWidth > 0 && <div className={`${statusColors[Status.NaoConforme]}`} style={{ width: `${nonCompliantWidth}%` }}></div>}
                {notApplicableWidth > 0 && <div className={`${statusColors[Status.NaoAplicavel]}`} style={{ width: `${notApplicableWidth}%` }}></div>}
              </div>
            </div>
          );
        })}
         <div className="flex justify-end pt-4 border-t border-slate-200 mt-6 gap-x-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-600">Conforme (C)</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-slate-600">Não Conforme (NC)</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-slate-600">Não Aplicável (NA)</span>
            </div>
        </div>
      </div>
    </div>
  );
};