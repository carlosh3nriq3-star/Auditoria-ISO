
import React, { useState, useEffect } from 'react';
import type { User, Role, AuthenticatedUser } from '../types';

interface UserManagementProps {
  users: User[];
  roles: Role[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: AuthenticatedUser | null;
  allEnvironments: string[];
}

const initialFormData = {
    id: '',
    name: '',
    email: '',
    roleId: '',
    allowedDepartments: [] as string[],
};

export const UserManagement: React.FC<UserManagementProps> = ({ users, roles, onAddUser, onUpdateUser, onDeleteUser, currentUser, allEnvironments }) => {
    const [formData, setFormData] = useState({
        ...initialFormData,
        roleId: roles[0]?.id || '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setFormData(prev => ({ ...prev, roleId: roles[0]?.id || '' }));
        }
    }, [roles, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDepartmentPermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentDepts = prev.allowedDepartments;
            if (checked) {
                return { ...prev, allowedDepartments: [...currentDepts, value] };
            } else {
                return { ...prev, allowedDepartments: currentDepts.filter(dept => dept !== value) };
            }
        });
    };
    
    const handleEditClick = (user: User) => {
        setIsEditing(true);
        setFormData({ ...user, allowedDepartments: user.allowedDepartments || [] });
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            ...initialFormData,
            roleId: roles[0]?.id || '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.roleId) {
            alert('Por favor, preencha todos os campos obrigatórios.');
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

    const roleColors: { [key: string]: string } = {
        'Admin': 'bg-purple-100 text-purple-800',
        'Auditor Líder': 'bg-blue-100 text-blue-800',
        'Auditor': 'bg-green-100 text-green-800',
    };

    // FIX: Changed parameter type to unknown and converted to string to handle potential type inference issues.
    const getRoleColor = (roleName: unknown) => {
        const key = String(roleName);
        return roleColors[key] || 'bg-slate-100 text-slate-800';
    }
    
    const roleMap = new Map(roles.map(role => [role.id, role.name]));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gerenciamento de Usuários</h1>
                <p className="text-sm text-slate-500 font-normal mt-1">
                    Adicione, edite ou remova usuários e suas permissões de acesso.
                </p>
            </div>

            {/* User Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-4 mb-6">
                    {isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white transition" />
                    </div>
                    <div>
                        <label htmlFor="roleId" className="block text-sm font-medium text-slate-700">Função</label>
                        <select name="roleId" id="roleId" value={formData.roleId} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Permissões de Acesso</label>
                        <div className="flex flex-wrap gap-x-6 gap-y-3 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                            {allEnvironments.map(env => (
                                <div key={env} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`env-${env}`}
                                        value={env}
                                        checked={formData.allowedDepartments.includes(env)}
                                        onChange={handleDepartmentPermissionChange}
                                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`env-${env}`} className="ml-2 text-sm text-slate-700">
                                        {env}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3 pt-4">
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acessos Permitidos</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map((user) => {
                                const roleName = roleMap.get(user.roleId) || 'N/A';
                                return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(roleName)}`}>
                                            {roleName}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex flex-wrap gap-1 max-w-sm">
                                            {user.allowedDepartments?.length > 0 ? user.allowedDepartments.map(dept => (
                                                <span key={dept} className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">{dept}</span>
                                            )) : <span className="text-xs text-slate-400 italic">Nenhum</span>}
                                        </div>
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
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
