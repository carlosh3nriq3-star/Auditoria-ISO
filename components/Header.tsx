import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';

interface HeaderProps {
    title: string;
    currentUser: User | null;
    onLogout: () => void;
}

const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ title, currentUser, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!currentUser) return null;

    return (
        <header className="md:hidden bg-slate-50/80 backdrop-blur-sm sticky top-0 z-40 p-4 border-b border-slate-200 flex justify-between items-center">
            <h1 className="text-lg font-bold text-slate-800 truncate">{title}</h1>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {currentUser.name.charAt(0)}
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 origin-top-right z-50">
                        <div className="py-1">
                            <div className="px-4 py-3 border-b border-slate-200">
                                <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                                <p className="text-xs text-slate-500">{currentUser.role}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onLogout();
                                }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <LogoutIcon className="w-5 h-5 text-slate-500" />
                                <span>Sair</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};