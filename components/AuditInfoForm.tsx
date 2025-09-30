import React from 'react';
import type { AuditInfo } from '../types';

interface AuditInfoFormProps {
  auditInfo: AuditInfo;
  setAuditInfo: React.Dispatch<React.SetStateAction<AuditInfo>>;
}

const FormInput: React.FC<{ label: string; value: string; name: keyof AuditInfo; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, name, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="mt-1">
            <input
                type="text"
                name={name}
                id={name}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition"
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);


export const AuditInfoForm: React.FC<AuditInfoFormProps> = ({ auditInfo, setAuditInfo }) => {
    
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuditInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-4 mb-6">Informações da Auditoria</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormInput label="Empresa" name="company" value={auditInfo.company} onChange={handleChange} />
        <FormInput label="Departamento/Área" name="department" value={auditInfo.department} onChange={handleChange} />
        <FormInput label="Auditor Líder" name="leadAuditor" value={auditInfo.leadAuditor} onChange={handleChange} />
        <FormInput label="Auditores Internos" name="internalAuditors" value={auditInfo.internalAuditors} onChange={handleChange} />
        <FormInput label="Auditados" name="auditees" value={auditInfo.auditees} onChange={handleChange} />
        <div>
            <label htmlFor="auditDate" className="block text-sm font-medium text-slate-700">Data da Auditoria</label>
            <div className="mt-1">
                <input
                    type="text"
                    name="auditDate"
                    id="auditDate"
                    className="shadow-sm block w-full sm:text-sm border-slate-300 rounded-md bg-slate-50 cursor-not-allowed"
                    value={auditInfo.auditDate}
                    readOnly
                />
            </div>
        </div>
      </div>
    </div>
  );
};