
import React, { useState } from 'react';

interface LoginProps {
    onLogin: (email: string, password: string) => void;
    error: string;
    onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg relative">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Auditoria ISO</h1>
                    <p className="mt-2 text-sm text-slate-600">Acesse sua conta para continuar</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Senha</label>
                            <button type="button" onClick={onForgotPassword} className="text-xs font-semibold text-blue-600 hover:text-blue-500">Esqueceu a senha?</button>
                        </div>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Entrar
                    </button>

                    <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
                        <p>Dica: Administradores podem redefinir senhas se necessário.</p>
                    </div>
                </form>
            </div>
        </div>
    );
};
