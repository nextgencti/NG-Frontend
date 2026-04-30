import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Mail, Building2, X } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instituteId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [adminsRes, institutesRes] = await Promise.all([
        api.get('/superadmin/admins'),
        api.get('/superadmin/institutes')
      ]);
      setAdmins(adminsRes.data.admins);
      setInstitutes(institutesRes.data.institutes);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/superadmin/admins', formData);
      toast.success(response.data.message);
      
      // Update local state with the new admin
      const instituteName = institutes.find(i => i.id === formData.instituteId)?.name || 'Unknown';
      setAdmins([{ ...response.data.admin, instituteName }, ...admins]);
      
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', instituteId: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">Manage Admins</h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Add Admin</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/5">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No administrators found</p>
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <div key={admin.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col h-full group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-white/5 shrink-0">
                    {admin.photoURL ? (
                      <img src={admin.photoURL} alt={admin.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary-400 font-bold text-lg">
                        {admin.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-lg tracking-tight truncate">{admin.name || admin.fullName}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      Standard Admin
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate text-slate-300 font-medium">
                      {admin.instituteName}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg glass-dark rounded-3xl border border-white/10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create Admin Account</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email (Google Account) <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
                <p className="text-xs text-slate-500 mt-2 ml-1">
                  The admin will login using this Google email address via Google SignIn.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Assign to Institute <span className="text-rose-500">*</span></label>
                <select
                  required
                  value={formData.instituteId}
                  onChange={(e) => setFormData({...formData, instituteId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="" className="bg-slate-800 text-slate-400">Select an institute</option>
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id} className="bg-slate-800 text-white">
                      {inst.name}
                    </option>
                  ))}
                </select>
                {institutes.length === 0 && (
                  <p className="text-xs text-rose-400 mt-2 ml-1">
                    You must create an Institute first before adding an Admin.
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.instituteId}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  ) : null}
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
