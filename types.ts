import type { FC, SVGProps } from 'react';

export enum Status {
  Conforme = 'Conforme',
  NaoConforme = 'Não Conforme',
  NaoAplicavel = 'Não Aplicável',
  NaoAuditado = 'Não Auditado',
}

export type ActionPlanStatus = 'Pendente' | 'Em Andamento' | 'Concluído';

export interface AnalysisData {
  rootCause: string;
  correctiveActions: string;
  fiveWhys?: string[];
}

export interface ObservationData {
  fact?: string;
  evidence?: string;
  requirement?: string;
  justification?: string;
}

export interface AuditInfo {
  company: string;
  department: string;
  leadAuditor: string;
  internalAuditors: string;
  auditees: string;
  auditDate: string;
}

export interface ChecklistItemData {
  id: string;
  requirement: string;
  description: string;
  status: Status;
  observations: ObservationData | string;
  department: string;
  standardName?: string;
  evidenceImage: { data: string; mimeType: string } | null;
  actionPlanStatus?: ActionPlanStatus;
  analysis?: AnalysisData;
}

export interface IsoStandard {
  id: string;
  name: string;
  items: ChecklistItemData[];
  icon?: FC<SVGProps<SVGSVGElement>>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Auditor' | 'Auditor Líder' | 'Admin';
  password?: string;
}
