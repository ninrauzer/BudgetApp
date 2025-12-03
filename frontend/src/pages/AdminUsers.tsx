import { useState, useEffect } from 'react';
import { Shield, Plus, X, ToggleLeft, ToggleRight, Trash2, Users, CheckCircle, XCircle } from 'lucide-react';

interface AllowedUser {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  added_at: string;
  added_by: string | null;
}

interface Stats {
  whitelist: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    admins: number;
    regular: number;
  };
}

export default function AdminUsers() {
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/allowed-users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok || !statsRes.ok) {
        if (usersRes.status === 403 || statsRes.status === 403) {
          setError('No tienes permisos de administrador');
          return;
        }
        throw new Error('Error al cargar datos');
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setAllowedUsers(usersData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/allowed-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail, name: newName || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al agregar usuario');
      }

      setSuccess(`Usuario ${newEmail} agregado exitosamente`);
      setNewEmail('');
      setNewName('');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar usuario');
    }
  };

  const handleToggleUser = async (userId: number, email: string) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/allowed-users/${userId}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al cambiar estado');
      }

      const data = await res.json();
      setSuccess(data.message);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${email} de la lista de autorizados?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/allowed-users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al eliminar usuario');
      }

      const data = await res.json();
      setSuccess(data.message);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-text-primary">
            <Shield className="w-8 h-8 text-purple-600" />
            Administración de Usuarios
          </h1>
          <p className="text-text-secondary mt-2">
            Gestiona quién puede acceder a BudgetApp
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 font-bold text-sm transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-800">{success}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                Usuarios Autorizados
              </p>
            </div>
            <p className="text-3xl font-black text-text-primary">{stats.whitelist.active}</p>
            <p className="text-xs text-text-secondary mt-1">
              {stats.whitelist.inactive} inactivos
            </p>
          </div>

          <div className="bg-white border-2 border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                Administradores
              </p>
            </div>
            <p className="text-3xl font-black text-text-primary">{stats.users.admins}</p>
            <p className="text-xs text-text-secondary mt-1">
              {stats.users.regular} usuarios regulares
            </p>
          </div>

          <div className="bg-white border-2 border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                Total Usuarios
              </p>
            </div>
            <p className="text-3xl font-black text-text-primary">{stats.users.total}</p>
            <p className="text-xs text-text-secondary mt-1">En el sistema</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border-2 border-border rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b-2 border-border">
          <h2 className="text-xl font-extrabold text-text-primary">
            Lista de Usuarios Autorizados
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b-2 border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Agregado
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Por
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allowedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">{user.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">
                      {new Date(user.added_at).toLocaleDateString('es-PE')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">{user.added_by || 'system'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleUser(user.id, user.email)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title={user.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {user.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {allowedUsers.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No hay usuarios autorizados
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Agregar Usuario</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="usuario@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Nombre completo"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-border rounded-lg text-text-secondary hover:bg-surface transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:scale-105 transition-all"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
