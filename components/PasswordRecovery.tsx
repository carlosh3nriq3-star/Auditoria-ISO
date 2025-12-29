
import React, { useState } from 'react';
import type { User } from '../types';

interface PasswordRecoveryProps {
    users: User[];
    onBack: () => void;
    onReset: (userId: string, newPassword: string) => void;
}

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ users, onBack, onReset }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: Question, 3: New Password
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            if (!user.securityQuestion) {
                setError('Este usuário não possui pergunta de segurança configurada. Entre em contato com o administrador.');
            } else {
                setFoundUser(user);
                setStep(2);
                setError('');
            }
        } else {
            setError('E-mail não encontrado no sistema.');
        }
    };

    const handleAnswerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (foundUser && answer.toLowerCase().trim() === foundUser.securityAnswer?.toLowerCase().trim()) {
            setStep(3);
            setError('');
        } else {
            setError('Resposta incorreta. Tente novamente.');
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (foundUser) {
            onReset(foundUser.id, newPassword);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Recuperação de Acesso</h1>
                    <div className="mt-4 flex justify-center gap-2">
                        <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        <div className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                    </div>
                </div>

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <p className="text-sm text-slate-600">Informe seu e-mail cadastrado para localizar sua conta.</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="exemplo@email.com"
                            />
                        </div>
                        {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                        <div className="flex flex-col gap-3 pt-2">
                            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition">
                                Continuar
                            </button>
                            <button type="button" onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                                Voltar ao Login
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && foundUser && (
                    <form onSubmit={handleAnswerSubmit} className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Pergunta de Segurança</p>
                            <p className="text-sm text-slate-800">{foundUser.securityQuestion}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Sua Resposta</label>
                            <input
                                type="text"
                                required
                                value={answer}
                                onChange={(e) => { setAnswer(e.target.value); setError(''); }}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                        <div className="flex flex-col gap-3 pt-2">
                            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition">
                                Validar Resposta
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                                Usar outro e-mail
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <p className="text-sm text-slate-600 font-medium">Resposta correta! Agora defina sua nova senha.</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                        <div className="pt-2">
                            <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition shadow-md">
                                Redefinir Senha
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
