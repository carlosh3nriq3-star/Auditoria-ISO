
import React, { useState } from 'react';

interface ComplianceChartProps {
  data: {
    id: string;
    name: string;
    conforme: number;
    naoConforme: number;
  }[];
}

interface TooltipData {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });

  const handleMouseOver = (e: React.MouseEvent, standard: ComplianceChartProps['data'][0]) => {
    const content = `
      <strong>${standard.name}</strong><br />
      Conforme: ${standard.conforme}<br />
      Não Conforme: ${standard.naoConforme}
    `;
    setTooltip({
      visible: true,
      content,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const TooltipComponent = () => (
    tooltip.visible ? (
      <div
        style={{
          position: 'fixed',
          top: tooltip.y + 10,
          left: tooltip.x + 10,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
        }}
        className="bg-slate-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg z-50"
        dangerouslySetInnerHTML={{ __html: tooltip.content }}
      />
    ) : null
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full relative">
      <TooltipComponent />
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Conformidade por Norma</h3>
      <div className="space-y-4">
        {data.map((standard) => {
          const total = standard.conforme + standard.naoConforme;
          const compliantPercentage = total > 0 ? (standard.conforme / total) * 100 : 0;
          const nonCompliantPercentage = total > 0 ? (standard.naoConforme / total) * 100 : 0;
          
          return (
            <div key={standard.id}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-medium text-slate-700">{standard.name}</p>
                 <div className="text-xs text-slate-500">
                  <span className="font-semibold text-green-600">{standard.conforme} C</span> / <span className="font-semibold text-red-600">{standard.naoConforme} NC</span>
                </div>
              </div>
              <div 
                className="flex w-full h-4 bg-red-200 rounded-full overflow-hidden cursor-pointer"
                onMouseMove={(e) => handleMouseOver(e, standard)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="bg-green-500 transition-all duration-500 h-full"
                  style={{ width: `${compliantPercentage}%` }}
                  title={`Conforme: ${compliantPercentage.toFixed(1)}%`}
                ></div>
                <div
                  className="bg-red-500 transition-all duration-500 h-full"
                  style={{ width: `${nonCompliantPercentage}%` }}
                   title={`Não Conforme: ${nonCompliantPercentage.toFixed(1)}%`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
