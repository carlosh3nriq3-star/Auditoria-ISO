
import React, { useState } from 'react';
import type { AuthenticatedUser } from '../types';

interface ChangePasswordProps {
    currentUser: AuthenticatedUser;
    onSave: (newPassword?: string, question?: string, answer?: string) => void;
    onCancel: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ currentUser, onSave, onCancel }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [question, setQuestion] = useState(currentUser.securityQuestion || '');
    const [answer, setAnswer] = useState(currentUser.securityAnswer || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation for password change if touched
        if (password || confirmPassword) {
            if (password.length < 4) {
                setError('A senha deve ter pelo menos 4 caracteres.');
                return;
            }
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }
        }

        // Validation for security question
        if (question && !answer) {
            setError('Você deve fornecer uma resposta para a pergunta de segurança.');
            return;
        }

        onSave(password || undefined, question || undefined, answer || undefined);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-4 mb-6">Configurações de Segurança</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Password Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alterar Senha</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nova Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Deixe em branco para manter"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Confirme a nova senha"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Security Question Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recuperação de Senha</h3>
                        <p className="text-sm text-slate-600">Configure uma pergunta de segurança para recuperar sua conta caso esqueça a senha.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Pergunta de Segurança</label>
                                <select 
                                    value={question} 
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">Selecione uma pergunta...</option>
                                    <option value="Qual o nome do seu primeiro animal de estimação?">Qual o nome do seu primeiro animal de estimação?</option>
                                    <option value="Qual a sua cidade natal?">Qual a sua cidade natal?</option>
                                    <option value="Qual o modelo do seu primeiro carro?">Qual o modelo do seu primeiro carro?</option>
                                    <option value="Qual o nome da sua primeira escola?">Qual o nome da sua primeira escola?</option>
                                    <option value="Qual a sua comida favorita?">Qual a sua comida favorita?</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Sua Resposta</label>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => { setAnswer(e.target.value); setError(''); }}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Resposta para recuperação"
                                />
                                <p className="mt-1 text-xs text-slate-400 italic">A resposta não diferencia maiúsculas/minúsculas na recuperação.</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700 transition shadow-md text-sm"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Sem uma pergunta de segurança configurada, você não conseguirá redefinir sua senha sozinho se perdê-la. Mantenha estas informações atualizadas.
                </p>
            </div>
        </div>
    );
};
