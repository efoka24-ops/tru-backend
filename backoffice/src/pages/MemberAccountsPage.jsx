// backoffice/src/pages/MemberAccountsPage.jsx
import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, Copy, Check,
  AlertCircle, CheckCircle, User, Mail, Shield, Clock,
  Loader, LogIn, RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com'}/api`;

export default function MemberAccountsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [notification, setNotification] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    initialPassword: '',
    role: 'member'
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    status: 'active',
    role: 'member'
  });

  const queryClient = useQueryClient();
  const token = localStorage.getItem('adminToken');

  // Récupérer liste des membres
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/admin/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      return data.members || [];
    },
    enabled: !!token
  });

  // Créer un compte
  const createAccountMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_URL}/admin/members/${data.memberId}/account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: data.email,
          initialPassword: data.initialPassword,
          role: data.role
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: `Account created! Login code: ${data.account.loginCode}`
      });
      setCreateDialogOpen(false);
      setFormData({ email: '', initialPassword: '', role: 'member' });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Modifier un compte
  const updateAccountMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_URL}/admin/members/${data.memberId}/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: data.email,
          status: data.status,
          role: data.role
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update account');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: 'Account updated successfully'
      });
      setEditDialogOpen(false);
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Supprimer un compte
  const deleteAccountMutation = useMutation({
    mutationFn: async (memberId) => {
      const response = await fetch(`${API_URL}/admin/members/${memberId}/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete account');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: 'Account deleted successfully'
      });
      setDeleteConfirm(null);
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Générer nouveau code
  const generateCodeMutation = useMutation({
    mutationFn: async (memberId) => {
      const response = await fetch(`${API_URL}/admin/members/${memberId}/login-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to generate code');
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: `New code generated: ${data.loginCode}`
      });
      setCopiedCode(null);
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  const handleCreateAccount = (member) => {
    setSelectedMember(member);
    setFormData({
      email: member.email || '',
      initialPassword: '',
      role: 'member'
    });
    setCreateDialogOpen(true);
  };

  const handleEditAccount = (member) => {
    setSelectedMember(member);
    setEditFormData({
      email: member.account?.email || '',
      status: member.account?.status || 'active',
      role: member.account?.role || 'member'
    });
    setEditDialogOpen(true);
  };

  const handleSubmitCreate = () => {
    if (!selectedMember || !formData.email) {
      setNotification({
        type: 'error',
        message: 'Email is required'
      });
      return;
    }

    createAccountMutation.mutate({
      memberId: selectedMember.id,
      ...formData
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedMember) return;

    updateAccountMutation.mutate({
      memberId: selectedMember.id,
      ...editFormData
    });
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6" />
            Member Accounts Management
          </h2>
          <p className="text-slate-600 mt-1">Create and manage member access accounts</p>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Account Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Last Login</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {members.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">{member.name}</td>
                  <td className="px-6 py-4">
                    {member.account?.hasAccount ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-4 h-4" />
                        {member.account.email}
                      </div>
                    ) : (
                      <span className="text-slate-400">No account</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {member.account?.hasAccount ? (
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        member.account.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {member.account.status}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {member.account?.hasAccount ? (
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <Shield className="w-4 h-4" />
                        {member.account.role}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {member.account?.lastLogin ? (
                      new Date(member.account.lastLogin).toLocaleDateString('fr-FR')
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {!member.account?.hasAccount ? (
                      <Button
                        size="sm"
                        onClick={() => handleCreateAccount(member)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAccount(member)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateCodeMutation.mutate(member.id)}
                          disabled={generateCodeMutation.isPending}
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirm(member)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Create Account for {selectedMember?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="member@trugroup.cm"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Initial Password (Optional)</label>
              <Input
                type="password"
                value={formData.initialPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, initialPassword: e.target.value }))}
                placeholder="Leave empty to require login code"
                className="bg-white border-slate-300 text-slate-900"
              />
              <p className="text-slate-500 text-xs mt-1">If left empty, member will use login code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitCreate}
                disabled={createAccountMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createAccountMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Account - {selectedMember?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <Input
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={updateAccountMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateAccountMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete the account for {deleteConfirm?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountMutation.mutate(deleteConfirm.id)}
              disabled={deleteAccountMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
