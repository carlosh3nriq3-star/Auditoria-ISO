import React, { useState, useCallback, useMemo } from 'react';
import { SideNav } from './components/SideNav';
import { AuditInfoForm } from './components/AuditInfoForm';
import { Checklist } from './components/Checklist';
import { Dashboard } from './components/Dashboard';
import { ReportGenerator } from './components/ReportGenerator';
import { UserManagement } from './components/UserManagement';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { ActionPlanManagement } from './components/ActionPlanManagement';
import type { AuditInfo, IsoStandard, ChecklistItemData, User, ActionPlanStatus, AnalysisData } from './types';
import { Status } from './types';
import { ISO_STANDARDS } from './constants';
import { generateObservations, generateRootCauseAnalysis } from './services/geminiService';

const INITIAL_USERS: User[] = [
    { id: 'user-1', name: 'João Silva', email: 'joao.silva@example.com', role: 'Auditor Líder' },
    { id: 'user-2', name: 'Maria Souza', email: 'maria.souza@example.com', role: 'Auditor' },
    { id: 'user-3', name: 'Pedro Santos', email: 'pedro.santos@example.com', role: 'Admin' },
    { id: 'user-4', name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
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

  const [standards, setStandards] = useState<IsoStandard[]>(ISO_STANDARDS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [analyzingItemId, setAnalyzingItemId] = useState<string | null>(null);
  const [dashboardFilter, setDashboardFilter] = useState<string>('all'); // 'all' or standard.id
  const [departmentFilter, setDepartmentFilter] = useState<string>('all'); // 'all' or department name
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [showLogin, setShowLogin] = useState<boolean>(false);

  const handleLogin = (email: string, password: string): void => {
      // NOTE: A verificação de senha foi removida para esta aplicação de demonstração para evitar o armazenamento de senhas em texto plano.
      // Em uma aplicação real, a autenticação deve ser tratada por um serviço de backend seguro.
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
          setCurrentUser(user);
          setShowLogin(false); // Hide login form on success
          setLoginError('');
      } else {
          setLoginError('Usuário não encontrado.');
      }
  };

  const handleLogout = (): void => {
      setCurrentUser(null);
      setShowLogin(false); // Go back to landing page
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

  const handleStatusChange = useCallback(async (itemId: string, newStatus: Status, standardId: string) => {
    setLoadingItemId(itemId);
    updateItemInStandards(itemId, standardId, { status: newStatus, observations: 'Gerando observação com IA...' });

    try {
      const standard = standards.find(s => s.id === standardId);
      const item = standard?.items.find(i => i.id === itemId);
      if (item && standard) {
        const observation = await generateObservations({ ...item, status: newStatus }, auditInfo, standard.name);
        updateItemInStandards(itemId, standardId, { observations: observation });
      }
    } catch (error) {
      console.error("Failed to generate observation:", error);
      updateItemInStandards(itemId, standardId, { observations: 'Erro ao gerar observação. Por favor, tente novamente.' });
    } finally {
      setLoadingItemId(null);
    }
  }, [auditInfo, standards]);
  
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

  const handleAnalyze = useCallback(async (itemId: string, standardId: string) => {
    setAnalyzingItemId(itemId);
    try {
        const standard = standards.find(s => s.id === standardId);
        const item = standard?.items.find(i => i.id === itemId);
        if (item && standard) {
            updateItemInStandards(itemId, standardId, { analysis: { rootCause: 'Analisando com IA...', correctiveActions: 'Aguarde...' } });
            const analysis = await generateRootCauseAnalysis(item, auditInfo, standard.name);
            updateItemInStandards(itemId, standardId, { analysis });
        }
    } catch (error) {
        console.error("Failed to generate root cause analysis:", error);
        updateItemInStandards(itemId, standardId, { analysis: { rootCause: 'Erro ao gerar análise.', correctiveActions: 'Por favor, tente novamente.' } });
    } finally {
        setAnalyzingItemId(null);
    }
  }, [auditInfo, standards]);

  const handleActionPlanStatusChange = (itemId: string, standardId: string, newStatus: ActionPlanStatus) => {
    updateItemInStandards(itemId, standardId, { actionPlanStatus: newStatus });
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

  const activeStandard = standards.find(s => s.id === activeView);

  const allDepartments = useMemo(() => {
    const departments = new Set(standards.flatMap(s => s.items.map(item => item.department)));
    return ['all', ...Array.from(departments).sort()];
  }, [standards]);

  const dashboardStats = useMemo(() => {
    const allItemsFromAllStandards = standards.flatMap(s => s.items.map(item => ({ ...item, standardName: s.name, standardId: s.id })));
    
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

    const complianceByStandard = standards
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
  }, [standards, dashboardFilter, departmentFilter]);
  
  const renderContent = () => {
    if (activeView === 'dashboard') {
      return (
        <Dashboard 
            stats={dashboardStats}
            standards={standards}
            filter={dashboardFilter}
            setFilter={setDashboardFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            departments={allDepartments}
        />
      );
    }
    
    if (activeView === 'action-plans') {
        return <ActionPlanManagement standards={standards} onStatusChange={handleActionPlanStatusChange} />;
    }

    if (activeView === 'report') {
        return <ReportGenerator auditInfo={auditInfo} standards={standards} />;
    }

    if (activeView === 'users') {
        if (currentUser?.role !== 'Admin') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-2xl shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <h2 className="text-2xl font-bold text-slate-800">Acesso Negado</h2>
                    <p className="text-slate-500 mt-2">Você não tem permissão para acessar esta página. Contate um administrador.</p>
                </div>
            )
        }
        return <UserManagement 
            users={users} 
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            currentUser={currentUser}
        />;
    }
    
    if (activeStandard) {
      return (
        <>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">
                {activeStandard.name}
                <p className="text-sm text-slate-500 font-normal mt-1">
                  Uma ferramenta inteligente para auditorias de normas ISO.
                </p>
            </h1>
            
            <AuditInfoForm auditInfo={auditInfo} setAuditInfo={setAuditInfo} />

            <div className="mt-8 bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <Checklist 
                  standard={activeStandard} 
                  onStatusChange={(itemId, newStatus) => handleStatusChange(itemId, newStatus, activeStandard.id)} 
                  onImageUpload={handleImageUpload}
                  onAnalyze={handleAnalyze}
                  loadingItemId={loadingItemId}
                  analyzingItemId={analyzingItemId}
                />
            </div>
        </>
      );
    }
    
    return <p>Selecione uma norma para começar.</p>;
  }

  if (!currentUser) {
    if (showLogin) {
        return <Login onLogin={handleLogin} error={loginError} onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 font-sans flex">
      <SideNav 
        standards={standards} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-8 space-y-8">
            <div className="container mx-auto">
              {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
}