import React from 'react';

interface ComplianceChartProps {
  data: {
    id: string;
    name: string;
    conforme: number;
    naoConforme: number;
  }[];
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Conformidade por Norma</h3>
      <div className="space-y-4">
        {data.map((standard) => {
          const total = standard.conforme + standard.naoConforme;
          const compliantWidth = total > 0 ? (standard.conforme / total) * 100 : 0;
          
          return (
            <div key={standard.id}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-medium text-slate-700">{standard.name}</p>
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-green-600">{standard.conforme} C</span> / <span className="font-semibold text-red-600">{standard.naoConforme} NC</span>
                </div>
              </div>
              <div className="flex w-full h-3 bg-red-100 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${compliantWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};