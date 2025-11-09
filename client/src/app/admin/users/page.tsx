'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EditCustomerModal } from '@/components/admin/modals/EditCustomerModal';
import { ViewUserModal } from '@/components/admin/modals/ViewUserModal';
import { User } from '@/types';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    // Simulate API call with realistic data
    setTimeout(() => {
      setUsers(generateRealisticUsers());
      setIsLoading(false);
    }, 1500);
  }, []);

  // Filter users based on all criteria
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    moderatorUsers: users.filter(u => u.role === 'moderator').length,
    newThisMonth: users.filter(u => {
      const created = new Date(u.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    totalSpent: users.reduce((sum, user) => sum + (Math.random() * 5000), 0)
  };

  // Modal handlers
  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = (updatedUser: User) => {
    if (updatedUser.id.startsWith('new-')) {
      // Add new user
      const newUser = {
        ...updatedUser,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUsers(prev => [newUser, ...prev]);
    } else {
      // Update existing user
      setUsers(prev => prev.map(u =>
        u.id === updatedUser.id ? { ...updatedUser, updatedAt: new Date().toISOString() } : u
      ));
    }
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleAddUser = () => {
    router.push('/admin/users/create');
  };

  const handleCreateUser = () => {
    router.push('/admin/users/create');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() } : u
    ));
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    switch (bulkAction) {
      case 'activate':
        setUsers(prev => prev.map(u =>
          selectedUsers.includes(u.id) ? { ...u, isActive: true, updatedAt: new Date().toISOString() } : u
        ));
        break;
      case 'deactivate':
        setUsers(prev => prev.map(u =>
          selectedUsers.includes(u.id) ? { ...u, isActive: false, updatedAt: new Date().toISOString() } : u
        ));
        break;
      case 'make_admin':
        setUsers(prev => prev.map(u =>
          selectedUsers.includes(u.id) ? { ...u, role: 'admin', updatedAt: new Date().toISOString() } : u
        ));
        break;
      case 'make_moderator':
        setUsers(prev => prev.map(u =>
          selectedUsers.includes(u.id) ? { ...u, role: 'moderator', updatedAt: new Date().toISOString() } : u
        ));
        break;
      case 'make_user':
        setUsers(prev => prev.map(u =>
          selectedUsers.includes(u.id) ? { ...u, role: 'user', updatedAt: new Date().toISOString() } : u
        ));
        break;
      case 'delete':
        setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
        break;
    }

    setSelectedUsers([]);
    setBulkAction('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, permissions, and access levels
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Upload size={20} />
            Import
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Download size={20} />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateUser}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add User
          </motion.button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: <Users className="w-5 h-5" />,
            color: 'blue'
          },
          {
            label: 'Active Users',
            value: stats.activeUsers,
            icon: <UserCheck className="w-5 h-5" />,
            color: 'green'
          },
          {
            label: 'Admins',
            value: stats.adminUsers,
            icon: <Shield className="w-5 h-5" />,
            color: 'purple'
          },
          {
            label: 'Moderators',
            value: stats.moderatorUsers,
            icon: <UserCheck className="w-5 h-5" />,
            color: 'orange'
          },
          {
            label: 'New This Month',
            value: stats.newThisMonth,
            icon: <Calendar className="w-5 h-5" />,
            color: 'indigo'
          },
          {
            label: 'Total Revenue',
            value: `$${stats.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: <Users className="w-5 h-5" />,
            color: 'green'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                stat.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                'bg-green-100 text-green-600'
              }`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="moderator">Moderators</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              More Filters
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="make_admin">Make Admin</option>
                    <option value="make_moderator">Make Moderator</option>
                    <option value="make_user">Make User</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user.id}
              user={user}
              index={index}
              isSelected={selectedUsers.includes(user.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedUsers(prev => [...prev, user.id]);
                } else {
                  setSelectedUsers(prev => prev.filter(id => id !== user.id));
                }
              }}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search filters'
              : 'Get started by creating your first user account'
            }
          </p>
          <div className="mt-6">
            <Button onClick={handleCreateUser}>
              <Plus size={16} className="mr-2" />
              Add User
            </Button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <ViewUserModal
        user={viewingUser}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingUser(null);
        }}
        onEdit={handleEditUser}
      />

      <EditCustomerModal
        customer={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
}

// User Card Component
function UserCard({
  user,
  index,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onToggleStatus
}: {
  user: User;
  index: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string) => void;
}) {
  const getGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-teal-500 to-green-500',
      'from-indigo-500 to-purple-500'
    ];
    return gradients[index % gradients.length];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'moderator': return <UserCheck className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-100">
        <CardContent className="p-6">
          {/* Selection Checkbox */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>

          {/* User Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getGradient(index)} flex items-center justify-center text-white font-semibold`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(user)}>
                  <Eye size={16} className="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(user.id)}>
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(user.id)}
                  className="text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={16} />
              {user.email}
            </div>
            {user.lastLogin && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                Last login: {new Date(user.lastLogin).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.floor(Math.random() * 50) + 5}
              </div>
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                ${(Math.random() * 5000 + 500).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500">Spent</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.random() > 0.5 ? '4.8' : '4.5'}
              </div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Generate realistic user data
function generateRealisticUsers(): User[] {
  const names = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
    'Emily Davis', 'Chris Lee', 'Amanda Garcia', 'Robert Miller', 'Lisa Taylor',
    'James Wilson', 'Maria Garcia', 'William Clark', 'Linda Martinez', 'Richard Anderson',
    'Susan Thomas', 'Charles White', 'Patricia Harris', 'Thomas Martin', 'Jennifer Thompson'
  ];

  const roles: ('user' | 'admin' | 'moderator')[] = ['user', 'admin', 'moderator'];

  return names.map((name, index) => ({
    id: `user-${1000 + index}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    role: index < 2 ? 'admin' : index < 5 ? 'moderator' : 'user',
    isActive: Math.random() > 0.1, // 90% active
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
}
