
import React, { useState, useMemo } from 'react';
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

interface TooltipData {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const statusColors: { [key in Status]?: string } = {
  [Status.Conforme]: '#22c55e', // green-500
  [Status.NaoConforme]: '#ef4444', // red-500
  [Status.NaoAplicavel]: '#eab308', // yellow-500
};

const statusOrder: Status[] = [Status.Conforme, Status.NaoConforme, Status.NaoAplicavel];

export const RequirementsChart: React.FC<RequirementsChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<TooltipData>({ visible: false, content: '', x: 0, y: 0 });
  
  const chartData = useMemo(() => data.filter(d => 
    d[Status.Conforme] > 0 || d[Status.NaoConforme] > 0 || d[Status.NaoAplicavel] > 0
  ), [data]);

  const handleMouseOver = (e: React.MouseEvent, content: string) => {
    setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
  };
  
  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };
  
  const TooltipComponent = () => (
    tooltip.visible ? (
      <div
        style={{
          position: 'fixed',
          top: tooltip.y,
          left: tooltip.x,
          transform: 'translate(10px, -100%)',
          pointerEvents: 'none',
        }}
        className="bg-slate-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg z-50"
        dangerouslySetInnerHTML={{ __html: tooltip.content }}
      />
    ) : null
  );

  const chartHeight = 250;
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 40 };
  const maxCount = useMemo(() => {
    if (chartData.length === 0) return 10;
    const maxVal = Math.max(...chartData.map(d => d[Status.Conforme] + d[Status.NaoConforme] + d[Status.NaoAplicavel]));
    return Math.ceil(maxVal / 5) * 5 || 5; // Round up to nearest 5
  }, [chartData]);
  
  const yAxisLabels = useMemo(() => Array.from({ length: 6 }, (_, i) => Math.round(maxCount / 5 * i)), [maxCount]);

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
        <TooltipComponent />
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Achados por Requisito</h3>
        <div className="w-full" style={{ height: `${chartHeight}px` }}>
            <svg width="100%" height="100%" viewBox={`0 0 500 ${chartHeight}`}>
                <g transform={`translate(${chartPadding.left}, ${chartPadding.top})`}>
                    {/* Y-axis grid and labels */}
                    {yAxisLabels.map(label => {
                        const y = chartHeight - chartPadding.bottom - chartPadding.top - (label / maxCount * (chartHeight - chartPadding.bottom - chartPadding.top));
                        return (
                            <g key={label}>
                                <line x1="0" y1={y} x2={500 - chartPadding.left - chartPadding.right} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                                <text x="-10" y={y + 3} textAnchor="end" fontSize="10" fill="#64748b">{label}</text>
                            </g>
                        )
                    })}
                    
                    {/* Bars */}
                    {chartData.map((item, index) => {
                        const barWidth = (500 - chartPadding.left - chartPadding.right) / (chartData.length + 1);
                        const x = index * (barWidth * 1.2);
                        let currentY = chartHeight - chartPadding.bottom - chartPadding.top;

                        return (
                            <g key={item.requirement}>
                                {statusOrder.map(status => {
                                    const value = item[status];
                                    if(value === 0) return null;
                                    
                                    const barHeight = (value / maxCount) * (chartHeight - chartPadding.top - chartPadding.bottom);
                                    const rectY = currentY - barHeight;
                                    currentY = rectY;

                                    const tooltipContent = `<strong>Req. ${item.requirement}</strong><br />${status}: ${value}`;
                                    
                                    return (
                                        <rect
                                            key={status}
                                            x={x}
                                            y={rectY}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={statusColors[status]}
                                            onMouseMove={(e) => handleMouseOver(e, tooltipContent)}
                                            onMouseLeave={handleMouseLeave}
                                            style={{ transition: 'all 0.3s ease' }}
                                        />
                                    );
                                })}
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight - chartPadding.bottom - chartPadding.top + 15}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#334155"
                                >
                                    {item.requirement}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
         <div className="flex justify-end pt-4 border-t border-slate-200 mt-6 gap-x-4">
             {statusOrder.map(status => (
                <div key={status} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[status] }}></div>
                    <span className="text-xs text-slate-600">{status}</span>
                </div>
             ))}
        </div>
    </div>
  );
};
