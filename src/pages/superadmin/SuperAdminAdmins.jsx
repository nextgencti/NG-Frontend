import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Mail, Building2, X, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Staff Members</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Add Staff</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No staff members found</p>
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <div key={admin.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary-500/30 transition-all flex flex-col h-full group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100 shrink-0">
                    {admin.photoURL ? (
                      <img src={admin.photoURL} alt={admin.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary-600 font-bold text-sm">
                        {admin.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-[15px] tracking-tight truncate">{admin.name || admin.fullName}</h3>
                    <div className="flex items-center gap-1.5 text-primary-600">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Admin Access</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-auto pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-700 font-semibold">
                      {admin.instituteName}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Admin Modal - Light Theme */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Create Admin Account</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="admin@example.com"
                />
                <p className="text-[10px] text-slate-400 mt-1 ml-1 leading-tight">
                  Must be a Google email for sign-in verification.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Assign Institute</label>
                <select
                  required
                  value={formData.instituteId}
                  onChange={(e) => setFormData({...formData, instituteId: e.target.value})}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="" className="text-slate-400">Select an institute</option>
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.instituteId}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-[13px] font-bold transition-all shadow-md disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
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
