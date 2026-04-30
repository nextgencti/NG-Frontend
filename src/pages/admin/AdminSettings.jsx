import React, { useState, useEffect } from 'react';
import { User, Building2, Save, Mail, Phone, MapPin, Camera, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { currentUser, setCurrentUser } = useAuth();
  const [activeTab, setActiveTab ] = useState('profile'); // 'profile' or 'institute'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: ''
  });

  const [instituteData, setInstituteData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    logoURL: ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [instituteLogo, setInstituteLogo] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, instRes] = await Promise.all([
        api.get('/admin/profile'),
        api.get('/admin/institute')
      ]);
      
      if (profileRes.data.success) {
        setProfileData(profileRes.data.profile);
        setProfilePreview(profileRes.data.profile.photoURL);
      }
      if (instRes.data.success) {
        setInstituteData(instRes.data.institute);
        setLogoPreview(instRes.data.institute.logoURL);
      }
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      if (profilePhoto) {
        formData.append('photo', profilePhoto);
      }

      const res = await api.put('/admin/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile updated successfully');
        const updatedUser = res.data.user;
        
        // Sync with AuthContext and LocalStorage
        const fullUpdatedUser = { ...currentUser, ...updatedUser };
        setCurrentUser(fullUpdatedUser);
        localStorage.setItem('user', JSON.stringify(fullUpdatedUser));
        
        setProfileData(updatedUser);
        setProfilePreview(updatedUser.photoURL);
        setProfilePhoto(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateInstitute = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', instituteData.name);
      formData.append('address', instituteData.address);
      formData.append('phone', instituteData.phone);
      formData.append('email', instituteData.email);
      if (instituteLogo) {
        formData.append('logo', instituteLogo);
      }

      const res = await api.put('/admin/institute', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Institute details updated successfully');
        const updatedInst = res.data.institute;

        // Sync Institute Name and Logo with Nav
        const fullUpdatedUser = { ...currentUser, instituteName: updatedInst.name, instituteLogoURL: updatedInst.logoURL };
        setCurrentUser(fullUpdatedUser);
        localStorage.setItem('user', JSON.stringify(fullUpdatedUser));

        setInstituteData(updatedInst);
        setLogoPreview(updatedInst.logoURL);
        setInstituteLogo(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };


  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'profile') {
        setProfilePhoto(file);
        setProfilePreview(URL.createObjectURL(file));
      } else {
        setInstituteLogo(file);
        setLogoPreview(URL.createObjectURL(file));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-500 font-medium">Manage your personal profile and institute information.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'profile' 
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
              : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          Personal Profile
        </button>
        <button
          onClick={() => setActiveTab('institute')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'institute' 
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
              : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Institute Details
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row gap-10">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  id="profilePhoto"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                />
                <label 
                  htmlFor="profilePhoto" 
                  className="w-32 h-32 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-sm"
                >
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </label>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Change Photo</span>
              </div>

              <div className="flex-1 grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold placeholder:text-slate-400"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-500 cursor-not-allowed font-bold"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold placeholder:text-slate-400"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Personal Info
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdateInstitute} className="space-y-8 relative z-10">
            <div className="flex flex-col sm:flex-row gap-10">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  id="instituteLogo"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'institute')}
                />
                <label 
                  htmlFor="instituteLogo"
                  className="w-32 h-32 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-sm"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </label>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Logo</span>
              </div>

              <div className="flex-1 grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Institute Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={instituteData.name}
                      onChange={(e) => setInstituteData({ ...instituteData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold placeholder:text-slate-400"
                      placeholder="Institute name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={instituteData.email}
                      onChange={(e) => setInstituteData({ ...instituteData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold placeholder:text-slate-400"
                      placeholder="Contact email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={instituteData.phone}
                      onChange={(e) => setInstituteData({ ...instituteData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold placeholder:text-slate-400"
                      placeholder="Contact phone number"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      value={instituteData.address}
                      onChange={(e) => setInstituteData({ ...instituteData, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold min-h-[120px] placeholder:text-slate-400"
                      placeholder="Detailed institute address"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Institute Info
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
