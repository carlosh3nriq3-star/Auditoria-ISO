
import React, { useState, useRef, useEffect } from 'react';
import type { AuthenticatedUser } from '../types';

interface HeaderProps {
    title: string;
    currentUser: AuthenticatedUser | null;
    setActiveView: (view: string) => void;
}

const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ title, currentUser, setActiveView }) => {
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
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white focus:outline-none">
                    {currentUser.name.charAt(0)}
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 origin-top-right z-50">
                        <div className="py-1">
                            <div className="px-4 py-3 border-b border-slate-200">
                                <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                                <p className="text-xs text-slate-500">{currentUser.roleName}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setActiveView('change-password');
                                }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                                <KeyIcon className="w-5 h-5 text-slate-500" />
                                <span>Configurações</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
