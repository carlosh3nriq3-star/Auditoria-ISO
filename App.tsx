import React, { useState, useCallback, useMemo } from 'react';
import { SideNav } from './components/SideNav';
import { AuditInfoForm } from './components/AuditInfoForm';
import { Checklist } from './components/Checklist';
import { Dashboard } from './components/Dashboard';
import { ReportGenerator } from './components/ReportGenerator';
import { UserManagement } from './components/UserManagement';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { AuditHistory } from './components/AuditHistory';
import { CompletedAuditView } from './components/CompletedAuditView';
import type { AuditInfo, IsoStandard, ChecklistItemData, User, Role, AuthenticatedUser, Permission, CompletedAudit } from './types';
import { Status } from './types';
import { ISO_STANDARDS } from './constants';
import { generateObservation } from './services/geminiService';

const ALL_POSSIBLE_DEPARTMENTS = [
    ...new Set(ISO_STANDARDS.flatMap(s => s.items.map(item => item.department)))
].sort();

export const ALL_ENVIRONMENTS = [
    'Dashboard',
    'Relatório',
    'Usuários',
    'Histórico',
    ...ISO_STANDARDS.map(s => s.name)
];

const INITIAL_ROLES: Role[] = [
    { id: 'role-admin', name: 'Admin', permissions: ['VIEW_DASHBOARD', 'PERFORM_AUDIT', 'GENERATE_REPORTS', 'MANAGE_USERS'] },
    { id: 'role-lead', name: 'Auditor Líder', permissions: ['VIEW_DASHBOARD', 'PERFORM_AUDIT', 'GENERATE_REPORTS'] },
    { id: 'role-auditor', name: 'Auditor', permissions: ['VIEW_DASHBOARD', 'PERFORM_AUDIT'] },
];

const INITIAL_USERS: User[] = [
    { id: 'user-1', name: 'João Silva', email: 'joao.silva@example.com', roleId: 'role-lead', allowedDepartments: ['Dashboard', 'Relatório', 'Histórico', 'ISO 9001:2015', 'ISO 14001:2015'] },
    { id: 'user-2', name: 'Maria Souza', email: 'maria.souza@example.com', roleId: 'role-auditor', allowedDepartments: ['Dashboard', 'ISO 45001:2018'] },
    { id: 'user-3', name: 'Pedro Santos', email: 'pedro.santos@example.com', roleId: 'role-admin', allowedDepartments: ALL_ENVIRONMENTS },
    { id: 'user-4', name: 'Admin User', email: 'admin@example.com', roleId: 'role-admin', allowedDepartments: ALL_ENVIRONMENTS },
];

export default function App() {
  const [auditInfo, setAuditInfo] = useState<AuditInfo>({
    company: 'Empresa Exemplo S.A.',
    department: 'Produção',
    leadAuditor: 'João Silva',
    internalAuditors: 'Maria Souza, Pedro Santos',
    auditees: 'Equipe de Produção',
    auditDate: new Date().toLocaleDateString('pt-BR'),
  });

  const [standards, setStandards] = useState<IsoStandard[]>(() => JSON.parse(JSON.stringify(ISO_STANDARDS)));
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const roles: Role[] = INITIAL_ROLES;
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [dashboardFilter, setDashboardFilter] = useState<string>('all'); // 'all' or standard.id
  const [departmentFilter, setDepartmentFilter] = useState<string>('all'); // 'all' or department name
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [generatingItems, setGeneratingItems] = useState<Set<string>>(new Set());
  const [completedAudits, setCompletedAudits] = useState<CompletedAudit[]>([]);
  const [historyFilters, setHistoryFilters] = useState({
    company: '',
    startDate: '',
    endDate: '',
  });

  const handleLogin = (email: string, password: string): void => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
          const role = roles.find(r => r.id === user.roleId);
          if (role) {
            const initialView = user.allowedDepartments.includes('Dashboard') ? 'dashboard' : user.allowedDepartments[0] || '';
            const viewId = ISO_STANDARDS.find(s => s.name === initialView)?.id || initialView.toLowerCase();
            
            setCurrentUser({
                ...user,
                permissions: role.permissions,
                roleName: role.name,
            });
            setShowLogin(false);
            setLoginError('');
            setActiveView(viewId);
          } else {
            setLoginError('Função de usuário inválida ou não encontrada.');
          }
      } else {
          setLoginError('Usuário não encontrado.');
      }
  };

  const handleLogout = (): void => {
      setCurrentUser(null);
      setShowLogin(false);
      setActiveView('dashboard');
  };

  const updateItemInStandards = (itemId: string, standardId: string, updates: Partial<ChecklistItemData>) => {
    setStandards(prevStandards => 
      prevStandards.map(s => 
        s.id === standardId
          ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
          : s
      )
    );
  };

  const accessibleStandards = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    // Admins see everything, simplifies management.
    if (currentUser.roleName === 'Admin') {
        return standards;
    }

    // Filter standards based on user's allowed views.
    return standards.filter(standard => 
        currentUser.allowedDepartments?.includes(standard.name)
    );
  }, [currentUser, standards]);

  const handleGenerateObservation = useCallback(async (itemId: string, standardId: string) => {
    const standard = standards.find(s => s.id === standardId);
    const item = standard?.items.find(i => i.id === itemId);

    if (!item || !standard) return;

    setGeneratingItems(prev => new Set(prev).add(itemId));
    updateItemInStandards(itemId, standardId, { observations: 'Gerando observação com IA...' });

    try {
        const observation = await generateObservation(item, standard.name);
        updateItemInStandards(itemId, standardId, { observations: observation });
    } catch (error) {
        console.error(error);
        updateItemInStandards(itemId, standardId, { observations: 'Erro ao gerar observação.' });
    } finally {
        setGeneratingItems(prev => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
        });
    }
  }, [standards]);

  const handleStatusChange = (itemId: string, newStatus: Status, standardId: string) => {
    const standard = standards.find(s => s.id === standardId);
    const item = standard?.items.find(i => i.id === itemId);

    if (!item) return;

    if (newStatus === Status.NaoAplicavel) {
        updateItemInStandards(itemId, standardId, {
            status: newStatus,
            observations: 'Este requisito não se aplica ao escopo desta auditoria.'
        });
    } else if (newStatus === Status.NaoAuditado) {
        updateItemInStandards(itemId, standardId, {
            status: newStatus,
            observations: ''
        });
    } else { // Conforme or NaoConforme
        updateItemInStandards(itemId, standardId, { status: newStatus });
        if (item.observations.trim() === '') {
            handleGenerateObservation(itemId, standardId);
        }
    }
  };
  
  const handleObservationChange = (itemId: string, standardId: string, value: string) => {
    updateItemInStandards(itemId, standardId, { observations: value });
  };

  const handleImageUpload = (itemId: string, standardId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        updateItemInStandards(itemId, standardId, {
            evidenceImage: { data: base64String.split(',')[1], mimeType: file.type }
        });
    };
    reader.readAsDataURL(file);
  };

  const handleAddUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `user-${Date.now()}` };
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      alert("Você não pode excluir sua própria conta.");
      return;
    }
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };
  
  const dashboardStats = useMemo(() => {
    const allItemsFromAllStandards = accessibleStandards.flatMap(s => s.items.map(item => ({ ...item, standardName: s.name, standardId: s.id })));
    
    const itemsFilteredByStandard = dashboardFilter === 'all'
        ? allItemsFromAllStandards
        : allItemsFromAllStandards.filter(item => item.standardId === dashboardFilter);

    const filteredItemsForStats = departmentFilter === 'all'
        ? itemsFilteredByStandard
        : itemsFilteredByStandard.filter(item => item.department === departmentFilter);

    const totalItems = filteredItemsForStats.length;
    const auditedItems = filteredItemsForStats.filter(item => item.status !== Status.NaoAuditado);
    const auditedItemsCount = auditedItems.length;
    const compliantItems = auditedItems.filter(item => item.status === Status.Conforme);
    const nonCompliantItems = filteredItemsForStats.filter(item => item.status === Status.NaoConforme);

    const compliancePercentage = auditedItemsCount > 0 ? (compliantItems.length / auditedItemsCount) * 100 : 0;
    const overallProgress = totalItems > 0 ? (auditedItemsCount / totalItems) * 100 : 0;

    const complianceByStandard = accessibleStandards
      .filter(s => dashboardFilter === 'all' || s.id === dashboardFilter)
      .map(standard => {
        const standardItemsFilteredByDept = departmentFilter === 'all'
            ? standard.items
            : standard.items.filter(item => item.department === departmentFilter);

        const conforme = standardItemsFilteredByDept.filter(i => i.status === Status.Conforme).length;
        const naoConforme = standardItemsFilteredByDept.filter(i => i.status === Status.NaoConforme).length;
        return { id: standard.id, name: standard.name, conforme, naoConforme };
      });
    
    const statusByRequirement = Object.values(
      filteredItemsForStats.reduce((acc, item) => {
        if (item.status === Status.NaoAuditado) {
          return acc; // Do not include not-audited items in the chart
        }
        const req = item.requirement;
        if (!acc[req]) {
          acc[req] = {
            requirement: req,
            [Status.Conforme]: 0,
            [Status.NaoConforme]: 0,
            [Status.NaoAplicavel]: 0,
          };
        }
        if (item.status === Status.Conforme || item.status === Status.NaoConforme || item.status === Status.NaoAplicavel) {
            acc[req][item.status]++;
        }
        return acc;
      }, {} as Record<string, { requirement: string; 'Conforme': number; 'Não Conforme': number; 'Não Aplicável': number }>)
    ).sort((a: { requirement: string }, b: { requirement: string }) => a.requirement.localeCompare(b.requirement, undefined, { numeric: true }));

    return {
      auditedItemsCount,
      compliancePercentage,
      nonCompliantCount: nonCompliantItems.length,
      overallProgress,
      complianceByStandard,
      statusByRequirement,
    };
  }, [accessibleStandards, dashboardFilter, departmentFilter]);
  
  const handleFinalizeAudit = () => {
    if (!window.confirm("Você tem certeza que deseja finalizar e arquivar esta auditoria? O checklist atual será reiniciado.")) {
        return;
    }

    const newCompletedAudit: CompletedAudit = {
        id: Date.now().toString(),
        completionDate: new Date().toLocaleDateString('pt-BR'),
        auditInfo: { ...auditInfo, auditDate: new Date().toLocaleDateString('pt-BR') }, // Capture current info
        standards: JSON.parse(JSON.stringify(standards)), // Deep copy of standards state
        summary: {
            compliancePercentage: dashboardStats.compliancePercentage,
            nonCompliantCount: dashboardStats.nonCompliantCount,
        },
    };

    setCompletedAudits(prev => [...prev, newCompletedAudit]);

    // Reset for next audit
    setStandards(JSON.parse(JSON.stringify(ISO_STANDARDS)));
    alert("Auditoria arquivada com sucesso! Um novo checklist está pronto para começar.");
    setActiveView('history');
  };

  const filteredAudits = useMemo(() => {
    const { company, startDate, endDate } = historyFilters;

    const parseBrDate = (dateString: string): Date => {
        const [day, month, year] = dateString.split('/');
        return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const startFilterDate = startDate ? new Date(startDate) : null;
    const endFilterDate = endDate ? new Date(endDate) : null;

    if (endFilterDate) {
        endFilterDate.setHours(23, 59, 59, 999);
    }

    return completedAudits.filter(audit => {
        const companyMatch = company === '' || audit.auditInfo.company.toLowerCase().includes(company.toLowerCase());
        const auditDate = parseBrDate(audit.completionDate);
        const startDateMatch = !startFilterDate || auditDate >= startFilterDate;
        const endDateMatch = !endFilterDate || auditDate <= endFilterDate;
        return companyMatch && startDateMatch && endDateMatch;
    });
  }, [completedAudits, historyFilters]);

  const activeStandard = accessibleStandards.find(s => s.id === activeView);

  const departmentsForFilter = useMemo(() => {
    const allItems = accessibleStandards.flatMap(s => s.items);
    const departments = new Set(allItems.map(item => item.department));
    return ['all', ...Array.from(departments).sort()];
  }, [accessibleStandards]);

  const pageTitle = useMemo(() => {
    if (activeView === 'dashboard') return 'Dashboard';
    if (activeView === 'report') return 'Gerador de Relatório';
    if (activeView === 'users') return 'Gerenciamento de Usuários';
    if (activeView === 'history') return 'Histórico de Auditorias';
    if (activeView.startsWith('history-')) return 'Detalhes da Auditoria Arquivada';
    const standard = standards.find(s => s.id === activeView);
    return standard ? standard.name : 'Auditoria ISO';
  }, [activeView, standards]);

  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-2xl shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <h2 className="text-2xl font-bold text-slate-800">Acesso Negado</h2>
        <p className="text-slate-500 mt-2">Você não tem permissão para acessar esta página. Contate um administrador.</p>
    </div>
  );

  const renderContent = () => {
    if (!currentUser) return null;
    
    if (activeView === 'dashboard') {
      if (!currentUser.allowedDepartments.includes('Dashboard')) return <AccessDenied />;
      return (
        <Dashboard 
            stats={dashboardStats}
            standards={accessibleStandards}
            filter={dashboardFilter}
            setFilter={setDashboardFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            departments={departmentsForFilter}
        />
      );
    }
    
    if (activeView === 'report') {
        if (!currentUser.allowedDepartments.includes('Relatório')) return <AccessDenied />;
        return <ReportGenerator auditInfo={auditInfo} standards={accessibleStandards} />;
    }

    if (activeView === 'users') {
        if (!currentUser.allowedDepartments.includes('Usuários')) return <AccessDenied />;
        return <UserManagement 
            users={users} 
            roles={roles}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            currentUser={currentUser}
            allEnvironments={ALL_ENVIRONMENTS}
        />;
    }

    if (activeView === 'history') {
        if (!currentUser.allowedDepartments.includes('Histórico')) return <AccessDenied />;
        return (
          <AuditHistory 
            audits={filteredAudits} 
            onViewAudit={(id) => setActiveView(`history-${id}`)} 
            filters={historyFilters}
            onFilterChange={setHistoryFilters}
          />
        );
    }

    if (activeView.startsWith('history-')) {
        if (!currentUser.allowedDepartments.includes('Histórico')) return <AccessDenied />;
        const auditId = activeView.split('-')[1];
        const selectedAudit = completedAudits.find(a => a.id === auditId);
        if (selectedAudit) {
            return <CompletedAuditView audit={selectedAudit} onBack={() => setActiveView('history')} />;
        }
        return <p>Auditoria não encontrada.</p>;
    }
    
    if (activeStandard) {
      const canPerformAudit = currentUser.permissions.includes('PERFORM_AUDIT');
      const canFinalize = currentUser.permissions.includes('GENERATE_REPORTS');
      return (
        <>
            <div className="hidden md:block">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">
                    {activeStandard.name}
                    <p className="text-sm text-slate-500 font-normal mt-1">
                      Uma ferramenta inteligente para auditorias de normas ISO.
                    </p>
                </h1>
            </div>
            
            <AuditInfoForm auditInfo={auditInfo} setAuditInfo={setAuditInfo} />
            
            {canFinalize && (
                 <div className="mt-8 -mb-4 flex justify-end">
                    <button
                        onClick={handleFinalizeAudit}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm disabled:bg-slate-400"
                        disabled={dashboardStats.auditedItemsCount === 0}
                        title={dashboardStats.auditedItemsCount === 0 ? "Audite ao menos um item para poder finalizar." : "Salva a auditoria atual no histórico e reinicia o checklist."}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                        Finalizar e Arquivar Auditoria
                    </button>
                </div>
            )}

            <div className="mt-8 bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <Checklist 
                  standard={activeStandard} 
                  onStatusChange={(itemId, newStatus) => handleStatusChange(itemId, newStatus, activeStandard.id)}
                  onObservationChange={(itemId, value) => handleObservationChange(itemId, activeStandard.id, value)}
                  onImageUpload={handleImageUpload}
                  generatingItems={generatingItems}
                  canEdit={canPerformAudit}
                />
            </div>
        </>
      );
    }
    
    return <p>Selecione uma norma para começar ou verifique suas permissões de acesso.</p>;
  }

  if (!currentUser) {
    if (showLogin) {
        return <Login onLogin={handleLogin} error={loginError} onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <div id="app-view" className="h-screen w-screen bg-slate-50 text-slate-800 font-sans flex">
      <SideNav 
        standards={accessibleStandards} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0">
        <Header title={pageTitle} currentUser={currentUser} onLogout={handleLogout} />
        <div className="p-4 md:p-8 space-y-8">
            <div className="container mx-auto">
              {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
}