import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Mail, Phone, MapPin, X } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function SuperAdminInstitutes() {
  const [institutes, setInstitutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const response = await api.get('/superadmin/institutes');
      setInstitutes(response.data.institutes);
    } catch (error) {
      toast.error('Failed to fetch institutes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInstitute = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/superadmin/institutes', formData);
      toast.success(response.data.message);
      setInstitutes([{ ...response.data.institute }, ...institutes]);
      setIsAddModalOpen(false);
      setFormData({ name: '', address: '', phone: '', email: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add institute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInstitutes = institutes.filter(inst => 
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">Manage Institutes</h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search institutes..."
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
            <span className="hidden sm:inline">Add Institute</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/5">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No institutes found</p>
            </div>
          ) : (
            filteredInstitutes.map((inst) => (
              <div key={inst.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col h-full group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-primary-500/30 transition-colors">
                    <Building2 className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-tight line-clamp-2">{inst.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                      {inst.status === 'active' ? 'Active' : inst.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  {inst.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="truncate">{inst.email}</span>
                    </div>
                  )}
                  {inst.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{inst.phone}</span>
                    </div>
                  )}
                  {inst.address && (
                    <div className="flex items-start gap-3 text-sm text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{inst.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Institute Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg glass-dark rounded-3xl border border-white/10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Institute</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInstitute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Institute Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g. NextGen Computer Institute"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="admin@institute.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Address</label>
                <textarea
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  placeholder="Full physical address..."
                />
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
                  disabled={isSubmitting || !formData.name}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  ) : null}
                  {isSubmitting ? 'Adding...' : 'Add Institute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
