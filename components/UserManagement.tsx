import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User | null;
}

const initialFormState = {
    id: '',
    name: '',
    email: '',
    role: 'Auditor' as User['role'],
};

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, currentUser }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditClick = (user: User) => {
        setIsEditing(true);
        setFormData(user);
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData(initialFormState);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert('Por favor, preencha os campos de nome e e-mail.');
            return;
        }

        if (isEditing) {
            onUpdateUser(formData as User);
        } else {
            const { id, ...newUser } = formData;
            onAddUser(newUser);
        }
        handleCancelEdit();
    };
    
    const handleDeleteClick = (userId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            onDeleteUser(userId);
        }
    }

    const roleColors: { [key in User['role']]: string } = {
        'Admin': 'bg-purple-100 text-purple-800',
        'Auditor Líder': 'bg-blue-100 text-blue-800',
        'Auditor': 'bg-green-100 text-green-800',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gerenciamento de Usuários</h1>
                <p className="text-sm text-slate-500 font-normal mt-1">
                    Adicione, edite ou remova usuários do sistema.
                </p>
            </div>

            {/* User Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-4 mb-6">
                    {isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">Função</label>
                        <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option>Auditor</option>
                            <option>Auditor Líder</option>
                            <option>Admin</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 flex items-center justify-end gap-3 pt-4">
                        {isEditing && (
                            <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition shadow-sm">
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm">
                            {isEditing ? 'Salvar Alterações' : 'Adicionar Usuário'}
                        </button>
                    </div>
                </form>
            </div>

            {/* User List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                 <h2 className="text-xl font-semibold text-slate-800 p-6">Usuários Registrados</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">E-mail</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-900">Editar</button>
                                        <button 
                                            onClick={() => handleDeleteClick(user.id)} 
                                            className="text-red-600 hover:text-red-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                                            disabled={user.id === currentUser?.id}
                                        >Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};