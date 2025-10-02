import React, { useState } from 'react';
import type { IsoStandard, AuthenticatedUser } from '../types';

interface SideNavProps {
    standards: IsoStandard[];
    activeView: string;
    setActiveView: (id: string) => void;
    currentUser: AuthenticatedUser | null;
    onLogout: () => void;
}

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.253 9.5 9.5 0 0 0-1.255-7.138 9.337 9.337 0 0 0-3.3-2.625 9.337 9.337 0 0 0-2.625-.372 9.337 9.337 0 0 0-4.121 2.253 9.5 9.5 0 0 0 1.255 7.138 9.337 9.337 0 0 0 3.3 2.625Zm-6.25 1.625a9.337 9.337 0 0 1-4.121-2.253 9.5 9.5 0 0 1 1.255-7.138 9.337 9.337 0 0 1 3.3-2.625 9.337 9.337 0 0 1 2.625-.372 9.337 9.337 0 0 1 4.121 2.253 9.5 9.5 0 0 1-1.255 7.138 9.337 9.337 0 0 1-3.3 2.625 9.337 9.337 0 0 1-2.625.372Zm-6.25-1.625a9.337 9.337 0 0 1-4.121-2.253 9.5 9.5 0 0 1 1.255-7.138 9.337 9.337 0 0 1 3.3-2.625 9.337 9.337 0 0 1 2.625-.372 9.337 9.337 0 0 1 4.121 2.253 9.5 9.5 0 0 1-1.255 7.138 9.337 9.337 0 0 1-3.3 2.625 9.337 9.337 0 0 1-2.625.372Z" />
    </svg>
);

const ArchiveBoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);


const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
);

const ListBulletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);


export const SideNav: React.FC<SideNavProps> = ({ standards, activeView, setActiveView, currentUser, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isNormasActive = standards.some(s => s.id === activeView);

    return (
        <>
            {/* Desktop Sidebar */}
            <nav className="hidden md:flex flex-col w-64 bg-slate-900 text-white flex-shrink-0">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-bold">Auditoria Interna ISO</h1>
                    <p className="text-sm text-slate-400">Assistente Interno</p>
                </div>
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {currentUser?.allowedDepartments.includes('Dashboard') && (
                        <button
                            onClick={() => setActiveView('dashboard')}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                                activeView === 'dashboard'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <HomeIcon className="w-6 h-6 flex-shrink-0" />
                            <span className="font-medium">Dashboard</span>
                        </button>
                    )}
                    
                    {currentUser?.allowedDepartments.includes('Relatório') && (
                        <button
                            onClick={() => setActiveView('report')}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                                activeView === 'report'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <DocumentTextIcon className="w-6 h-6 flex-shrink-0" />
                            <span className="font-medium">Relatório</span>
                        </button>
                    )}

                    {currentUser?.allowedDepartments.includes('Histórico') && (
                        <button
                            onClick={() => setActiveView('history')}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                                activeView.startsWith('history')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <ArchiveBoxIcon className="w-6 h-6 flex-shrink-0" />
                            <span className="font-medium">Histórico</span>
                        </button>
                    )}

                    {currentUser?.allowedDepartments.includes('Usuários') && (
                        <button
                            onClick={() => setActiveView('users')}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                                activeView === 'users'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <UsersIcon className="w-6 h-6 flex-shrink-0" />
                            <span className="font-medium">Usuários</span>
                        </button>
                    )}

                    <div className="pt-2">
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Normas</h3>
                        <div className="mt-2 space-y-2">
                            {standards.length > 0 ? (
                                standards.map((standard) => {
                                    const Icon = standard.icon;
                                    return (
                                        <button
                                            key={standard.id}
                                            onClick={() => setActiveView(standard.id)}
                                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                                                activeView === standard.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
                                            <span className="font-medium">{standard.name}</span>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="px-3 text-sm text-slate-400 italic">Nenhuma norma atribuída.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
                            {currentUser?.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-white truncate">{currentUser?.name}</p>
                            <p className="text-xs text-slate-400">{currentUser?.roleName}</p>
                        </div>
                         <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors" aria-label="Sair">
                            <LogoutIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-700 z-50">
                <div className="flex justify-around items-center h-16">
                    {currentUser?.allowedDepartments.includes('Dashboard') && (
                        <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 flex-1 ${activeView === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`} aria-label="Dashboard">
                            <HomeIcon className="w-6 h-6" />
                            <span className="text-xs mt-1 truncate">Dashboard</span>
                        </button>
                    )}
                     <button onClick={() => setIsMobileMenuOpen(true)} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 flex-1 ${isNormasActive ? 'text-blue-400' : 'text-slate-400'}`} aria-label="Normas">
                        <ListBulletIcon className="w-6 h-6" />
                        <span className="text-xs mt-1 truncate">Normas</span>
                    </button>
                    {currentUser?.allowedDepartments.includes('Histórico') && (
                        <button onClick={() => setActiveView('history')} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 flex-1 ${activeView.startsWith('history') ? 'text-blue-400' : 'text-slate-400'}`} aria-label="Histórico">
                            <ArchiveBoxIcon className="w-6 h-6" />
                            <span className="text-xs mt-1 truncate">Histórico</span>
                        </button>
                    )}
                     {currentUser?.allowedDepartments.includes('Usuários') && (
                        <button onClick={() => setActiveView('users')} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 flex-1 ${activeView === 'users' ? 'text-blue-400' : 'text-slate-400'}`} aria-label="Usuários">
                            <UsersIcon className="w-6 h-6" />
                            <span className="text-xs mt-1 truncate">Usuários</span>
                        </button>
                     )}
                    {currentUser?.allowedDepartments.includes('Relatório') && (
                        <button onClick={() => setActiveView('report')} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 flex-1 ${activeView === 'report' ? 'text-blue-400' : 'text-slate-400'}`} aria-label="Relatório">
                            <DocumentTextIcon className="w-6 h-6" />
                            <span className="text-xs mt-1 truncate">Relatório</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Standards Modal */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-slate-900 rounded-t-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Selecionar Norma</h3>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {standards.map((standard) => {
                                const Icon = standard.icon;
                                return (
                                    <button
                                        key={standard.id}
                                        onClick={() => {
                                            setActiveView(standard.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                                            activeView === standard.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
                                        <span className="font-medium">{standard.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};