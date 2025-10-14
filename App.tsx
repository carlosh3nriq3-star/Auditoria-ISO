
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SideNav } from './components/SideNav';
import { AuditInfoForm } from './components/AuditInfoForm';
import { Checklist } from './components/Checklist';
import { Dashboard } from './components/Dashboard';
import { ReportGenerator } from './components/ReportGenerator';
import { UserManagement } from './components/UserManagement';
import { Login } from './components/Login';
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
    { id: 'user-1', name: 'João Silva', email: 'joao.silva@example.com', password: '123', roleId: 'role-lead', allowedDepartments: ['Dashboard', 'Relatório', 'Histórico', 'ISO 9001:2015', 'ISO 14001:2015'] },
    { id: 'user-2', name: 'Maria Souza', email: 'maria.souza@example.com', password: '123', roleId: 'role-auditor', allowedDepartments: ['Dashboard', 'ISO 45001:2018'] },
    { id: 'user-3', name: 'Pedro Santos', email: 'pedro.santos@example.com', password: '123', roleId: 'role-admin', allowedDepartments: ALL_ENVIRONMENTS },
    { id: 'user-4', name: 'Admin', email: 'admin@admin.com', password: 'admin', roleId: 'role-admin', allowedDepartments: ALL_ENVIRONMENTS },
];

// Custom hook for persisting state to localStorage
function usePersistentState<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return initialValue instanceof Function ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}


export default function App() {
  const [auditInfo, setAuditInfo] = usePersistentState<AuditInfo>('auditInfo', {
    company: 'Empresa Exemplo S.A.',
    department: 'Produção',
    leadAuditor: 'João Silva',
    internalAuditors: 'Maria Souza, Pedro Santos',
    auditees: 'Equipe de Produção',
    auditDate: new Date().toLocaleDateString('pt-BR'),
  });

  const [standards, setStandards] = usePersistentState<IsoStandard[]>('standards', () => JSON.parse(JSON.stringify(ISO_STANDARDS)));
  const [users, setUsers] = usePersistentState<User[]>('users', INITIAL_USERS);
  const roles: Role[] = INITIAL_ROLES;
  const [activeView, setActiveView] = usePersistentState<string>('activeView', 'dashboard');
  const [dashboardFilter, setDashboardFilter] = usePersistentState<string>('dashboardFilter', 'all'); // 'all' or standard.id
  const [departmentFilter, setDepartmentFilter] = usePersistentState<string>('departmentFilter', 'all'); // 'all' or department name
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [generatingItems, setGeneratingItems] = useState<Set<string>>(new Set());
  const [completedAudits, setCompletedAudits] = usePersistentState<CompletedAudit[]>('completedAudits', []);
  // Fix: Explicitly typed the state for usePersistentState to resolve a type inference issue where
  // historyFilters properties were being inferred as `unknown`. This ensures `historyFilters.startDate`
  // and `historyFilters.endDate` are correctly typed as strings for use in `new Date()`.
  const [historyFilters, setHistoryFilters] = usePersistentState<{
    company: string;
    startDate: string;
    endDate: string;
  }>('historyFilters', {
    company: '',
    startDate: '',
    endDate: '',
  });

  const handleLogin = (email: string, password: string): void => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) {
          const role = roles.find(r => r.id === user.roleId);
          if (role) {
            const initialView = user.allowedDepartments.includes('Dashboard') ? 'dashboard' : user.allowedDepartments[0] || '';
            const viewId = ISO_STANDARDS.find(s => s.name === initialView)?.id || initialView.toLowerCase();
            
            setCurrentUser({
                ...user,
                permissions: role.permissions,
                roleName: role.name,
            });
            setLoginError('');
          } else {
            setLoginError('Função de usuário inválida ou não encontrada.');
          }
      } else {
          setLoginError('E-mail ou senha incorretos.');
      }
  };

  const handleLogout = (): void => {
      setCurrentUser(null);
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
    const defaultPassword = 'password123';
    const newUser = { ...user, id: `user-${Date.now()}`, password: defaultPassword };
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    // Simula o envio de um e-mail de configuração de senha
    console.log(`Simulando envio de e-mail para ${newUser.email} com senha temporária: ${defaultPassword}`);
    alert(`Um e-mail de configuração de senha foi enviado para ${newUser.email}. A senha temporária é: ${defaultPassword}`);
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
  
  const departmentsForFilter = useMemo(() => {
    const allPossibleDepts = new Set(accessibleStandards.flatMap(s => s.items.map(item => item.department)));
    const auditedDepartment = auditInfo.department.trim();

    if (auditedDepartment && !auditedDepartment.includes(',') && allPossibleDepts.has(auditedDepartment)) {
        return ['all', auditedDepartment];
    }

    return ['all', ...Array.from(allPossibleDepts).sort()];
  }, [accessibleStandards, auditInfo.department]);

  useEffect(() => {
    if (!departmentsForFilter.includes(departmentFilter)) {
        setDepartmentFilter('all');
    }
  }, [departmentsForFilter, departmentFilter, setDepartmentFilter]);

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
    const nonCompliantItems = auditedItems.filter(item => item.status === Status.NaoConforme);
    const compliantItems = auditedItems.filter(item => item.status === Status.Conforme);

    const auditableItemsForCompliance = auditedItems.filter(i => i.status === Status.Conforme || i.status === Status.NaoConforme).length;
    const compliancePercentage = auditableItemsForCompliance > 0
        ? (compliantItems.length / auditableItemsForCompliance) * 100
        : 0;

    const overallProgress = totalItems > 0 ? (auditedItemsCount / totalItems) * 100 : 0;
    
    const complianceByStandard = accessibleStandards.map(standard => {
        const standardItems = standard.items.filter(item => 
            departmentFilter === 'all' || item.department === departmentFilter
        );
        const conforme = standardItems.filter(item => item.status === Status.Conforme).length;
        const naoConforme = standardItems.filter(item => item.status === Status.NaoConforme).length;
        return { id: standard.id, name: standard.name, conforme, naoConforme };
    });

    const statusByRequirement: { requirement: string; [Status.Conforme]: number; [Status.NaoConforme]: number; [Status.NaoAplicavel]: number; }[] = [];
    
    const relevantRequirements = [...new Set(filteredItemsForStats.map(i => i.requirement))].sort();

    relevantRequirements.forEach(req => {
        const itemsForReq = filteredItemsForStats.filter(i => i.requirement === req);
        const conformeCount = itemsForReq.filter(i => i.status === Status.Conforme).length;
        const naoConformeCount = itemsForReq.filter(i => i.status === Status.NaoConforme).length;
        const naoAplicavelCount = itemsForReq.filter(i => i.status === Status.NaoAplicavel).length;
        
        if (conformeCount > 0 || naoConformeCount > 0 || naoAplicavelCount > 0) {
            statusByRequirement.push({
                requirement: req,
                [Status.Conforme]: conformeCount,
                [Status.NaoConforme]: naoConformeCount,
                [Status.NaoAplicavel]: naoAplicavelCount,
            });
        }
    });

    return {
      auditedItemsCount,
      compliancePercentage: isNaN(compliancePercentage) ? 0 : compliancePercentage,
      nonCompliantCount: nonCompliantItems.length,
      overallProgress,
      complianceByStandard,
      statusByRequirement,
    };
  }, [accessibleStandards, dashboardFilter, departmentFilter]);
  
  const activeStandard = useMemo(() => standards.find(s => s.id === activeView), [standards, activeView]);
  const completedAuditToView = useMemo(() => completedAudits.find(a => `history-${a.id}` === activeView), [completedAudits, activeView]);

  const handleFinishAudit = () => {
    if (window.confirm('Tem certeza que deseja finalizar e arquivar esta auditoria? Esta ação não pode ser desfeita.')) {
        const allItems = standards.flatMap(s => s.items);
        const auditableItems = allItems.filter(i => i.status === Status.Conforme || i.status === Status.NaoConforme);
        const compliantItems = auditableItems.filter(i => i.status === Status.Conforme);
        const nonCompliantItems = auditableItems.filter(i => i.status === Status.NaoConforme);

        const compliancePercentage = auditableItems.length > 0 ? (compliantItems.length / auditableItems.length) * 100 : 0;

        const newCompletedAudit: CompletedAudit = {
            id: Date.now().toString(),
            completionDate: new Date().toLocaleDateString('pt-BR'),
            auditInfo: { ...auditInfo },
            standards: JSON.parse(JSON.stringify(standards)),
            summary: {
                compliancePercentage: isNaN(compliancePercentage) ? 0 : compliancePercentage,
                nonCompliantCount: nonCompliantItems.length,
            }
        };

        setCompletedAudits(prev => [...prev, newCompletedAudit]);
        
        // Reset state for a new audit
        setStandards(JSON.parse(JSON.stringify(ISO_STANDARDS)));
        setAuditInfo({
            company: 'Empresa Exemplo S.A.',
            department: 'Produção',
            leadAuditor: currentUser?.name || '',
            internalAuditors: '',
            auditees: '',
            auditDate: new Date().toLocaleDateString('pt-BR'),
        });
        
        setActiveView('dashboard');
        alert('Auditoria finalizada e arquivada com sucesso!');
    }
  };
  
  const filteredCompletedAudits = useMemo(() => {
    return completedAudits.filter(audit => {
      // FIX: Explicitly cast historyFilters properties to string to prevent type errors.
      // This handles cases where values from localStorage might be inferred as `unknown`,
      // which would cause errors in string operations and Date constructors.
      const companyMatch = !historyFilters.company || audit.auditInfo.company.toLowerCase().includes(historyFilters.company.toLowerCase());
      if (historyFilters.startDate && historyFilters.endDate && historyFilters.startDate > historyFilters.endDate) {
        return false;
      }
      const dateParts = audit.completionDate.split('/');
      const date = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
      
      const startDateMatch = !historyFilters.startDate || date >= new Date(historyFilters.startDate);
      const endDateMatch = !historyFilters.endDate || date <= new Date(historyFilters.endDate);

      return companyMatch && startDateMatch && endDateMatch;
    });
  }, [completedAudits, historyFilters]);


  if (!currentUser) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }
  
  const canPerformAudit = currentUser.permissions.includes('PERFORM_AUDIT');

  return (
    <div id="app-view" className="flex h-screen bg-slate-100">
      <SideNav 
        standards={accessibleStandards} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            title={activeStandard?.name || (completedAuditToView ? "Detalhes da Auditoria" : activeView.charAt(0).toUpperCase() + activeView.slice(1))}
            currentUser={currentUser}
            onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 pb-20 md:pb-8">
            {activeView !== 'dashboard' && activeView !== 'report' && activeView !== 'users' && !activeView.startsWith('history') && (
                <AuditInfoForm auditInfo={auditInfo} setAuditInfo={setAuditInfo} />
            )}
            
            {activeView === 'dashboard' && currentUser.permissions.includes('VIEW_DASHBOARD') && (
                <Dashboard 
                    stats={dashboardStats} 
                    standards={accessibleStandards}
                    filter={dashboardFilter}
                    setFilter={setDashboardFilter}
                    departmentFilter={departmentFilter}
                    setDepartmentFilter={setDepartmentFilter}
                    departments={departmentsForFilter}
                />
            )}
            
            {activeStandard && (
              <Checklist
                standard={activeStandard}
                onStatusChange={(itemId, newStatus) => handleStatusChange(itemId, newStatus, activeStandard.id)}
                onObservationChange={(itemId, value) => handleObservationChange(itemId, activeStandard.id, value)}
                onImageUpload={handleImageUpload}
                generatingItems={generatingItems}
                canEdit={canPerformAudit}
              />
            )}
            
            {activeView === 'report' && currentUser.permissions.includes('GENERATE_REPORTS') && (
                <ReportGenerator auditInfo={auditInfo} standards={accessibleStandards} />
            )}

            {activeView === 'users' && currentUser.permissions.includes('MANAGE_USERS') && (
                <UserManagement
                    users={users}
                    roles={roles}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    currentUser={currentUser}
                    allEnvironments={ALL_ENVIRONMENTS}
                />
            )}
            
            {/* FIX: Pass missing `filters` and `onFilterChange` props to the AuditHistory component to resolve a TypeScript error. */}
            {activeView === 'history' && (
                <AuditHistory 
                    audits={filteredCompletedAudits} 
                    onViewAudit={(id) => setActiveView(`history-${id}`)}
                    filters={historyFilters}
                    onFilterChange={setHistoryFilters}
                />
            )}
            
            {completedAuditToView && (
                <CompletedAuditView audit={completedAuditToView} onBack={() => setActiveView('history')} />
            )}

            {!activeStandard && activeView !== 'dashboard' && activeView !== 'report' && activeView !== 'users' && activeView !== 'history' && !completedAuditToView && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h2.25M13.5 10.5H21M13.5 6H21" />
                    </svg>
                    <h2 className="text-xl font-semibold">Selecione uma opção no menu</h2>
                    <p>Escolha um dashboard, norma ou relatório para começar.</p>
                </div>
            )}
            
            {canPerformAudit && activeStandard && (
                <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40">
                    <button 
                        onClick={handleFinishAudit}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        Finalizar Auditoria
                    </button>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}