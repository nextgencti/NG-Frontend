import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Edit3, Globe, Save } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminInstitutes() {
  const { currentUser } = useAuth();
  const [institute, setInstitute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: ''
  });

  useEffect(() => {
    fetchInstituteDetails();
  }, []);

  const fetchInstituteDetails = async () => {
    try {
      const response = await api.get('/superadmin/institutes');
      const myInstitute = response.data.institutes[0];
      if (myInstitute) {
        setInstitute(myInstitute);
        setFormData({
          name: myInstitute.name || '',
          email: myInstitute.email || '',
          phone: myInstitute.phone || '',
          address: myInstitute.address || '',
          website: myInstitute.website || ''
        });
      }
    } catch (error) {
      toast.error('Failed to fetch institute details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/superadmin/institutes/${institute.id}`, formData);
      toast.success('Institute details updated successfully');
      setInstitute({ ...institute, ...formData });
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update details');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institute Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner - Reduced height */}
        <div className="h-24 bg-gradient-to-r from-primary-600 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-6 p-0.5 bg-white rounded-xl border-2 border-white shadow-lg">
            <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-10 h-10 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="pt-14 p-6">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Institute Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Website URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="https://institute.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Details
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{institute?.name}</h3>
                <div className="text-[11px] font-bold text-primary-600 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                  Primary Institution
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600 border border-primary-100">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                      <p className="text-sm text-slate-800 font-semibold">{institute?.email || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                      <p className="text-sm text-slate-800 font-semibold">{institute?.phone || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Website</p>
                      <p className="text-sm text-slate-800 font-semibold">{institute?.website || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Physical Address</p>
                      <p className="text-sm text-slate-800 font-semibold leading-relaxed">{institute?.address || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
