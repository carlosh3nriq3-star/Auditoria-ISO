import React from 'react';
import type { IsoStandard, ChecklistItemData } from './types';
import { Status } from './types';

// FIX: Rewrote SVG component using React.createElement to be compatible with a .ts file.
// JSX syntax is not allowed in .ts files and causes parsing errors.
const Icon9001: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
    )
);

// FIX: Rewrote SVG component using React.createElement to be compatible with a .ts file.
// JSX syntax is not allowed in .ts files and causes parsing errors.
const Icon14001: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.287 8.287 0 0 0 3-1.04 8.252 8.252 0 0 1 3.362-3.347Z" }),
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 21a9.754 9.754 0 0 1-4.592-1.168 9.75 9.75 0 1 0-9.132-14.385 9.75 9.75 0 0 1 13.724 15.553Z" })
    )
);

// FIX: Rewrote SVG component using React.createElement to be compatible with a .ts file.
// JSX syntax is not allowed in .ts files and causes parsing errors.
const Icon45001: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.73-.664 1.206-.864m-3.702 3.894L3 19.5V15l7.147-7.147M18 4.5l-2.426 2.426" })
    )
);

const iso9001Items: ChecklistItemData[] = [
    { id: '9001-4.1', requirement: '4.1', description: 'Entendimento da organização e seu contexto', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '9001-4.2', requirement: '4.2', description: 'Entendimento das necessidades e expectativas das partes interessadas', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '9001-5.1', requirement: '5.1', description: 'Liderança e comprometimento', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '9001-5.2', requirement: '5.2', description: 'Política da Qualidade', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '9001-6.1', requirement: '6.1', description: 'Ações para abordar riscos e oportunidades', status: Status.NaoAuditado, observations: '', department: 'Engenharia', evidenceImage: null },
    { id: '9001-6.2', requirement: '6.2', description: 'Objetivos da qualidade e planejamento para alcançá-los', status: Status.NaoAuditado, observations: '', department: 'Engenharia', evidenceImage: null },
    { id: '9001-7.1', requirement: '7.1', description: 'Recursos (geral, pessoas, infraestrutura, etc.)', status: Status.NaoAuditado, observations: '', department: 'RH', evidenceImage: null },
    { id: '9001-7.2', requirement: '7.2', description: 'Competência', status: Status.NaoAuditado, observations: '', department: 'RH', evidenceImage: null },
    { id: '9001-7.5', requirement: '7.5', description: 'Informação documentada', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '9001-8.1', requirement: '8.1', description: 'Planejamento e controle operacionais', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '9001-8.5', requirement: '8.5', description: 'Produção e provisão de serviço', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '9001-9.1', requirement: '9.1', description: 'Monitoramento, medição, análise e avaliação', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '9001-9.2', requirement: '9.2', description: 'Auditoria interna', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '9001-10.2', requirement: '10.2', description: 'Não conformidade e ação corretiva', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
];

const iso14001Items: ChecklistItemData[] = [
    { id: '14001-4.1', requirement: '4.1', description: 'Entendimento da organização e seu contexto', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '14001-5.2', requirement: '5.2', description: 'Política ambiental', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '14001-6.1.1', requirement: '6.1.1', description: 'Generalidades (Riscos e Oportunidades)', status: Status.NaoAuditado, observations: '', department: 'Engenharia', evidenceImage: null },
    { id: '14001-6.1.2', requirement: '6.1.2', description: 'Aspectos ambientais', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '14001-6.1.3', requirement: '6.1.3', description: 'Requisitos legais e outros', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '14001-7.4', requirement: '7.4', description: 'Comunicação (interna e externa)', status: Status.NaoAuditado, observations: '', department: 'RH', evidenceImage: null },
    { id: '14001-8.1', requirement: '8.1', description: 'Planejamento e controle operacionais', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '14001-8.2', requirement: '8.2', description: 'Preparação e resposta a emergências', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '14001-9.1.1', requirement: '9.1.1', description: 'Monitoramento, medição, análise e avaliação', status: Status.NaoAuditado, observations: '', department: 'Engenharia', evidenceImage: null },
    { id: '14001-10.3', requirement: '10.3', description: 'Melhoria contínua', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
];

const iso45001Items: ChecklistItemData[] = [
    { id: '45001-4.1', requirement: '4.1', description: 'Entendimento da organização e seu contexto', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '45001-5.2', requirement: '5.2', description: 'Política de SSO', status: Status.NaoAuditado, observations: '', department: 'RH', evidenceImage: null },
    { id: '45001-5.4', requirement: '5.4', description: 'Consulta e participação dos trabalhadores', status: Status.NaoAuditado, observations: '', department: 'RH', evidenceImage: null },
    { id: '45001-6.1.2', requirement: '6.1.2', description: 'Identificação de perigos e avaliação de riscos e oportunidades', status: Status.NaoAuditado, observations: '', department: 'Engenharia', evidenceImage: null },
    { id: '45001-7.2', requirement: '7.2', description: 'Competência', status: Status.NaoAuditado, observations: '', department: 'RH', evidenceImage: null },
    { id: '45001-8.1.2', requirement: '8.1.2', description: 'Eliminar perigos e reduzir riscos de SSO', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '45001-8.1.3', requirement: '8.1.3', description: 'Gestão de mudanças', status: Status.NaoAuditado, observations: '', department: 'Engenharia', evidenceImage: null },
    { id: '45001-8.2', requirement: '8.2', description: 'Preparação e resposta a emergências', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
    { id: '45001-9.1', requirement: '9.1', description: 'Monitoramento, medição, análise e avaliação de desempenho', status: Status.NaoAuditado, observations: '', department: 'Qualidade', evidenceImage: null },
    { id: '45001-10.2', requirement: '10.2', description: 'Incidente, não conformidade e ação corretiva', status: Status.NaoAuditado, observations: '', department: 'Produção', evidenceImage: null },
];

export const ISO_STANDARDS: IsoStandard[] = [
  {
    id: '9001',
    name: 'ISO 9001:2015',
    items: iso9001Items,
    icon: Icon9001
  },
  {
    id: '14001',
    name: 'ISO 14001:2015',
    items: iso14001Items,
    icon: Icon14001
  },
  {
    id: '45001',
    name: 'ISO 45001:2018',
    items: iso45001Items,
    icon: Icon45001
  },
];
