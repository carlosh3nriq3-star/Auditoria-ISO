
import React from 'react';
import type { IsoStandard } from '../types';
import { Status } from '../types';
import { SummaryCard } from './SummaryCard';
import { ComplianceChart } from './ComplianceChart';
import { RequirementsChart } from './RequirementsChart';

interface RequirementsChartData {
  requirement: string;
  [Status.Conforme]: number;
  [Status.NaoConforme]: number;
  [Status.NaoAplicavel]: number;
}
interface DashboardStats {
  auditedItemsCount: number;
  compliancePercentage: number;
  nonCompliantCount: number;
  overallProgress: number;
  complianceByStandard: { id: string; name: string; conforme: number; naoConforme: number; }[];
  statusByRequirement: RequirementsChartData[];
}

interface DashboardProps {
  stats: DashboardStats;
  standards: IsoStandard[];
  filter: string;
  setFilter: (filterId: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  departments: string[];
}

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);

const CheckBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, standards, filter, setFilter, departmentFilter, setDepartmentFilter, departments }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard da Auditoria</h1>
        <p className="text-sm text-slate-500 font-normal mt-1">
          Visão geral do progresso e conformidade da auditoria.
        </p>
      </div>
      
      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600 mr-2">Norma:</span>
            <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                filter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-200'
            }`}
            >
            Todas
            </button>
            {standards.map(standard => (
            <button
                key={standard.id}
                onClick={() => setFilter(standard.id)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                filter === standard.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-200'
                }`}
            >
                {standard.name.split(':')[0]}
            </button>
            ))}
        </div>

        <div className="flex items-center gap-2">
            <label htmlFor="department-filter" className="text-sm font-medium text-slate-600">Departamento:</label>
            <select
              id="department-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-1.5 pl-3 pr-8 text-sm font-semibold bg-white text-slate-700 rounded-full ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'Todos' : dept}
                </option>
              ))}
            </select>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
            title="Itens Auditados" 
            value={stats.auditedItemsCount} 
            icon={<ChartBarIcon className="w-8 h-8 text-blue-500" />} 
        />
        <SummaryCard 
            title="Conformidade" 
            value={`${stats.compliancePercentage.toFixed(1)}%`}
            icon={<CheckBadgeIcon className="w-8 h-8 text-green-500" />} 
        />
        <SummaryCard 
            title="Não Conformidades" 
            value={stats.nonCompliantCount} 
            icon={<ExclamationTriangleIcon className="w-8 h-8 text-red-500" />} 
        />
        <div className="bg-white p-6 rounded-2xl shadow-lg col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500">Progresso Geral</h3>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-3">
                <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${stats.overallProgress}%` }}
                ></div>
            </div>
            <p className="text-right text-sm font-semibold text-slate-700 mt-2">{`${stats.overallProgress.toFixed(0)}%`}</p>
        </div>
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 gap-8">
        <ComplianceChart data={stats.complianceByStandard} />
        <RequirementsChart data={stats.statusByRequirement} />
      </div>
    </div>
  );
};