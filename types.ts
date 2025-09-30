import type { FC, SVGProps } from 'react';

export enum Status {
  Conforme = 'Conforme',
  NaoConforme = 'Não Conforme',
  NaoAplicavel = 'Não Aplicável',
  NaoAuditado = 'Não Auditado',
}

export const ALL_PERMISSIONS = {
  VIEW_DASHBOARD: 'Ver Dashboard',
  PERFORM_AUDIT: 'Realizar Auditoria',
  GENERATE_REPORTS: 'Gerar Relatórios',
  MANAGE_USERS: 'Gerenciar Usuários',
} as const;

export type Permission = keyof typeof ALL_PERMISSIONS;

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
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
  observations: string;
  department: string;
  standardName?: string;
  evidenceImage: { data: string; mimeType: string } | null;
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
  roleId: string;
  password?: string;
  allowedDepartments: string[];
}

export interface AuthenticatedUser extends User {
  permissions: Permission[];
  roleName: string;
}

export interface CompletedAudit {
  id: string;
  completionDate: string;
  auditInfo: AuditInfo;
  standards: IsoStandard[];
  summary: {
    compliancePercentage: number;
    nonCompliantCount: number;
  };
}
