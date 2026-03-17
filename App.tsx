
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SideNav } from './components/SideNav';
import { AuditInfoForm } from './components/AuditInfoForm';
import { Checklist } from './components/Checklist';
import { Dashboard } from './components/Dashboard';
import { ReportGenerator } from './components/ReportGenerator';
import { UserManagement } from './components/UserManagement';
import { Header } from './components/Header';
import { AuditHistory } from './components/AuditHistory';
import { CompletedAuditView } from './components/CompletedAuditView';
import { ChangePassword } from './components/ChangePassword';
import type { AuditInfo, IsoStandard, ChecklistItemData, User, Role, AuthenticatedUser, CompletedAudit } from './types';
import { Status } from './types';
import { ISO_STANDARDS } from './constants';
import { generateObservation } from './services/geminiService';
import { dbService } from './services/dbService';

export const ALL_ENVIRONMENTS = [
    'Dashboard',
    'Relatório',
    'Histórico',
    ...ISO_STANDARDS.map(s => s.name)
];

const INITIAL_ROLES: Role[] = [
    { id: 'role-admin', name: 'Admin', permissions: ['VIEW_DASHBOARD', 'PERFORM_AUDIT', 'GENERATE_REPORTS', 'MANAGE_USERS'] },
    { id: 'role-lead', name: 'Auditor Líder', permissions: ['VIEW_DASHBOARD', 'PERFORM_AUDIT', 'GENERATE_REPORTS'] },
    { id: 'role-auditor', name: 'Auditor', permissions: ['VIEW_DASHBOARD', 'PERFORM_AUDIT'] },
];

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
  const [isLoading, setIsLoading] = useState(true);
  const [auditInfo, setAuditInfo] = useState<AuditInfo>({
    company: 'Empresa Exemplo S.A.',
    department: 'Produção',
    leadAuditor: 'João Silva',
    internalAuditors: 'Maria Souza, Pedro Santos',
    auditees: 'Equipe de Produção',
    auditDate: new Date().toLocaleDateString('pt-BR'),
  });

  const [standards, setStandards] = useState<IsoStandard[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const roles: Role[] = INITIAL_ROLES;
  const [activeView, setActiveView] = usePersistentState<string>('activeView', 'dashboard');
  const [dashboardFilter, setDashboardFilter] = usePersistentState<string>('dashboardFilter', 'all');
  const [departmentFilter, setDepartmentFilter] = usePersistentState<string>('departmentFilter', 'all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  
  const [currentUser, setCurrentUser] = usePersistentState<AuthenticatedUser | null>('currentUser', null);

  // Auto-login the first user (admin) if no user is logged in
  useEffect(() => {
    if (!isLoading && !currentUser && users.length > 0) {
      const adminUser = users[0];
      const adminRole = roles.find(r => r.id === adminUser.roleId);
      if (adminRole) {
        setCurrentUser({
          ...adminUser,
          permissions: adminRole.permissions,
          roleName: adminRole.name
        });
      }
    }
  }, [isLoading, currentUser, users, roles, setCurrentUser]);

  const [generatingItems, setGeneratingItems] = useState<Set<string>>(new Set());
  const [completedAudits, setCompletedAudits] = useState<CompletedAudit[]>([]);
  const [historyFilters, setHistoryFilters] = usePersistentState<{
    company: string;
    startDate: string;
    endDate: string;
  }>('historyFilters', {
    company: '',
    startDate: '',
    endDate: '',
  });

  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured) {
        // Fallback to local data for preview
        setUsers([{ id: 'user-admin', name: 'Admin', email: 'admin@admin.com', password: 'admin', roleId: 'role-admin', allowedDepartments: ALL_ENVIRONMENTS }]);
        setStandards(JSON.parse(JSON.stringify(ISO_STANDARDS)));
        setIsLoading(false);
        return;
      }
      try {
        const [fetchedUsers, fetchedAuditInfo, fetchedStandards, fetchedCompleted] = await Promise.all([
          dbService.getUsers(),
          dbService.getAuditInfo(),
          dbService.getStandards(),
          dbService.getCompletedAudits()
        ]);
        if (fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
        } else {
          // If DB is empty, provide a default admin user
          setUsers([{ id: 'user-admin', name: 'Admin', email: 'admin@admin.com', password: 'admin', roleId: 'role-admin', allowedDepartments: ALL_ENVIRONMENTS }]);
        }
        if (fetchedAuditInfo) setAuditInfo(fetchedAuditInfo);
        if (fetchedStandards.length > 0) {
          setStandards(fetchedStandards);
        } else {
          setStandards(JSON.parse(JSON.stringify(ISO_STANDARDS)));
        }
        if (fetchedCompleted.length > 0) setCompletedAudits(fetchedCompleted);
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
        // Fallback on error
        setUsers([{ id: 'user-admin', name: 'Admin', email: 'admin@admin.com', password: 'admin', roleId: 'role-admin', allowedDepartments: ALL_ENVIRONMENTS }]);
        setStandards(JSON.parse(JSON.stringify(ISO_STANDARDS)));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading && isSupabaseConfigured) {
      const timer = setTimeout(() => {
        dbService.updateAuditInfo(auditInfo);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [auditInfo, isLoading, isSupabaseConfigured]);

  const updateItemInStandards = (itemId: string, standardId: string, updates: Partial<ChecklistItemData>) => {
    setStandards(prevStandards => {
      const newStandards = prevStandards.map(s => 
        s.id === standardId
          ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
          : s
      );
      const updatedStandard = newStandards.find(s => s.id === standardId);
      if (updatedStandard) {
         dbService.updateStandard(updatedStandard);
      }
      return newStandards;
    });
  };

  const accessibleStandards = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.roleName === 'Admin') return standards;
    return standards.filter(standard => currentUser.allowedDepartments?.includes(standard.name));
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
        updateItemInStandards(itemId, standardId, { status: newStatus, observations: '' });
    } else {
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

  const handleAddUser = async (user: Omit<User, 'id'>) => {
    const defaultPassword = 'password123';
    const newUser = { ...user, id: `user-${Date.now()}`, password: defaultPassword };
    setUsers(prevUsers => [...prevUsers, newUser]);
    await dbService.addUser(newUser);
    alert(`Usuário criado com sucesso.`);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
    await dbService.updateUser(updatedUser);
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    await dbService.deleteUser(userId);
  };

  const handleResetUserPassword = async (userId: string) => {
    const defaultPass = '123456';
    const updatedUser = users.find(u => u.id === userId);
    if (updatedUser) {
        const userToUpdate = { ...updatedUser, password: defaultPass };
        setUsers(prevUsers => prevUsers.map(user => user.id === userId ? userToUpdate : user));
        await dbService.updateUser(userToUpdate);
        alert(`A senha do usuário foi redefinida para: ${defaultPass}`);
    }
  };

  const handleChangeOwnSecurity = async (newPassword?: string, question?: string, answer?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser };
    if (newPassword) updatedUser.password = newPassword;
    if (question) updatedUser.securityQuestion = question;
    if (answer) updatedUser.securityAnswer = answer;
    
    setCurrentUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
    await dbService.updateUser(updatedUser);

    alert('Configurações atualizadas!');
    setActiveView('dashboard');
  };
  
  const departmentsForFilter = useMemo(() => {
    const allPossibleDepts = new Set(accessibleStandards.flatMap(s => s.items.map(item => item.department)));
    const auditedDepartment = auditInfo.department.trim();
    if (auditedDepartment && !auditedDepartment.includes(',') && allPossibleDepts.has(auditedDepartment)) {
        return ['all', auditedDepartment];
    }
    return ['all', ...Array.from(allPossibleDepts).sort()];
  }, [accessibleStandards, auditInfo.department]);

  const dashboardStats = useMemo(() => {
    const allItemsFromAllStandards = accessibleStandards.flatMap(s => s.items.map(item => ({ ...item, standardName: s.name, standardId: s.id })));
    const itemsFilteredByStandard = dashboardFilter === 'all' ? allItemsFromAllStandards : allItemsFromAllStandards.filter(item => item.standardId === dashboardFilter);
    const filteredItemsForStats = departmentFilter === 'all' ? itemsFilteredByStandard : itemsFilteredByStandard.filter(item => item.department === departmentFilter);

    const totalItems = filteredItemsForStats.length;
    const auditedItems = filteredItemsForStats.filter(item => item.status !== Status.NaoAuditado);
    const compliantItems = auditedItems.filter(item => item.status === Status.Conforme);
    const auditableItemsForCompliance = auditedItems.filter(i => i.status === Status.Conforme || i.status === Status.NaoConforme).length;
    const compliancePercentage = auditableItemsForCompliance > 0 ? (compliantItems.length / auditableItemsForCompliance) * 100 : 0;
    const overallProgress = totalItems > 0 ? (auditedItems.length / totalItems) * 100 : 0;
    
    return {
      auditedItemsCount: auditedItems.length,
      compliancePercentage: isNaN(compliancePercentage) ? 0 : compliancePercentage,
      nonCompliantCount: auditedItems.filter(item => item.status === Status.NaoConforme).length,
      overallProgress,
      complianceByStandard: accessibleStandards.map(standard => {
        const standardItems = standard.items.filter(item => departmentFilter === 'all' || item.department === departmentFilter);
        return { id: standard.id, name: standard.name, conforme: standardItems.filter(item => item.status === Status.Conforme).length, naoConforme: standardItems.filter(item => item.status === Status.NaoConforme).length };
      }),
      statusByRequirement: [...new Set(filteredItemsForStats.map(i => i.requirement))].sort().map(req => {
        const items = filteredItemsForStats.filter(i => i.requirement === req);
        return { requirement: req, [Status.Conforme]: items.filter(i => i.status === Status.Conforme).length, [Status.NaoConforme]: items.filter(i => i.status === Status.NaoConforme).length, [Status.NaoAplicavel]: items.filter(i => i.status === Status.NaoAplicavel).length };
      }),
    };
  }, [accessibleStandards, dashboardFilter, departmentFilter]);
  
  const activeStandard = useMemo(() => standards.find(s => s.id === activeView), [standards, activeView]);
  const completedAuditToView = useMemo(() => completedAudits.find(a => `history-${a.id}` === activeView), [completedAudits, activeView]);

  const handleFinishAudit = async () => {
    if (window.confirm('Tem certeza que deseja finalizar e arquivar esta auditoria?')) {
        const allItems = standards.flatMap(s => s.items);
        const auditableItems = allItems.filter(i => i.status === Status.Conforme || i.status === Status.NaoConforme);
        const compliancePercentage = auditableItems.length > 0 ? (auditableItems.filter(i => i.status === Status.Conforme).length / auditableItems.length) * 100 : 0;

        const newAudit = {
            id: Date.now().toString(),
            completionDate: new Date().toLocaleDateString('pt-BR'),
            auditInfo: { ...auditInfo },
            standards: JSON.parse(JSON.stringify(standards)),
            summary: { compliancePercentage, nonCompliantCount: auditableItems.filter(i => i.status === Status.NaoConforme).length }
        };

        setCompletedAudits(prev => [...prev, newAudit]);
        await dbService.addCompletedAudit(newAudit);
        
        const resetStds = await dbService.resetStandards();
        setStandards(resetStds);

        const resetInfo = { company: 'Empresa Exemplo S.A.', department: 'Produção', leadAuditor: currentUser?.name || '', internalAuditors: '', auditees: '', auditDate: new Date().toLocaleDateString('pt-BR') };
        setAuditInfo(resetInfo);
        await dbService.updateAuditInfo(resetInfo);

        setActiveView('dashboard');
        alert('Auditoria arquivada com sucesso!');
    }
  };
  
  const filteredCompletedAudits = useMemo(() => {
    return completedAudits.filter(audit => {
      const companyMatch = !historyFilters.company || audit.auditInfo.company.toLowerCase().includes(String(historyFilters.company).toLowerCase());
      const dateParts = audit.completionDate.split('/');
      const date = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
      const startDateMatch = !historyFilters.startDate || date >= new Date(String(historyFilters.startDate));
      const endDateMatch = !historyFilters.endDate || date <= new Date(String(historyFilters.endDate));
      return companyMatch && startDateMatch && endDateMatch;
    });
  }, [completedAudits, historyFilters]);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-slate-100">
              <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Carregando...</p>
              </div>
          </div>
      );
  }

  if (!currentUser) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-slate-100">
              <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Autenticando...</p>
              </div>
          </div>
      );
  }

  const canPerformAudit = currentUser.permissions.includes('PERFORM_AUDIT');

  return (
    <div id="app-view" className="flex h-screen bg-slate-100 overflow-hidden">
      <SideNav 
        standards={accessibleStandards} activeView={activeView} setActiveView={setActiveView} 
        currentUser={currentUser} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            title={activeStandard?.name || (completedAuditToView ? "Detalhes da Auditoria" : activeView === 'change-password' ? 'Configurações' : activeView.charAt(0).toUpperCase() + activeView.slice(1))}
            currentUser={currentUser} setActiveView={setActiveView} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 pb-20 md:pb-8">
            {activeView !== 'dashboard' && activeView !== 'report' && activeView !== 'users' && activeView !== 'change-password' && !activeView.startsWith('history') && (
                <AuditInfoForm auditInfo={auditInfo} setAuditInfo={setAuditInfo} />
            )}
            
            {activeView === 'dashboard' && currentUser.permissions.includes('VIEW_DASHBOARD') && (
                <Dashboard 
                    stats={dashboardStats} standards={accessibleStandards} filter={dashboardFilter}
                    setFilter={setDashboardFilter} departmentFilter={departmentFilter}
                    setDepartmentFilter={setDepartmentFilter} departments={departmentsForFilter}
                />
            )}
            
            {activeStandard && (
              <Checklist
                standard={activeStandard}
                onStatusChange={(itemId, newStatus) => handleStatusChange(itemId, newStatus, activeStandard.id)}
                onObservationChange={(itemId, value) => handleObservationChange(itemId, activeStandard.id, value)}
                onImageUpload={handleImageUpload} generatingItems={generatingItems} canEdit={canPerformAudit}
              />
            )}
            
            {activeView === 'report' && currentUser.permissions.includes('GENERATE_REPORTS') && (
                <ReportGenerator auditInfo={auditInfo} standards={accessibleStandards} />
            )}

            {activeView === 'users' && currentUser.permissions.includes('MANAGE_USERS') && (
                <UserManagement
                    users={users} roles={roles} onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser}
                    onResetPassword={handleResetUserPassword}
                    currentUser={currentUser} allEnvironments={ALL_ENVIRONMENTS}
                />
            )}

            {activeView === 'history' && (
                <AuditHistory 
                    audits={filteredCompletedAudits} onViewAudit={(id) => setActiveView(`history-${id}`)}
                    filters={historyFilters} onFilterChange={setHistoryFilters}
                />
            )}
            
            {completedAuditToView && <CompletedAuditView audit={completedAuditToView} onBack={() => setActiveView('history')} />}

            {activeView === 'change-password' && (
                <ChangePassword currentUser={currentUser} onSave={handleChangeOwnSecurity} onCancel={() => setActiveView('dashboard')} />
            )}

            {!activeStandard && !['dashboard', 'report', 'users', 'history', 'change-password'].includes(activeView) && !completedAuditToView && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h2.25M13.5 10.5H21M13.5 6H21" />
                    </svg>
                    <h2 className="text-xl font-semibold">Selecione uma opção no menu</h2>
                </div>
            )}
            
            {canPerformAudit && activeStandard && (
                <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40">
                    <button onClick={handleFinishAudit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2">
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
