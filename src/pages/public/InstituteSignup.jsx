import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, User, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Logo from '../../components/Logo';
import { Link } from 'react-router-dom';

export default function InstituteSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    instituteName: '',
    email: '',
    phone: '',
    address: '',
    adminName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register-institute', formData);
      toast.success(response.data.message);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800 p-4">
        <div className="max-w-md w-full glass-dark p-10 rounded-3xl border border-white/10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Request Submitted!</h2>
          <p className="text-slate-400 mb-8">
            Thank you for registering your institute. Our Super Admin will review your request and contact you via email professionally.
          </p>
          <Link to="/" className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Back to Home <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-800 py-12 px-4">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-500/20 rounded-full blur-[100px]"></div>

      <div className="z-10 w-full max-w-2xl glass-dark rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          {/* Left Panel */}
          <div className="md:col-span-2 bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-white flex flex-col justify-between">
            <div>
              <Logo className="w-16 h-16 mb-8 brightness-0 invert" />
              <h2 className="text-2xl font-bold mb-4">Join NextGen Network</h2>
              <p className="text-primary-100/80 leading-relaxed">
                Empower your students with our state-of-the-art training management system.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary-100/60 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Centralized Management</span>
              </div>
              <div className="flex items-center gap-3 text-primary-100/60 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Automated Testing</span>
              </div>
              <div className="flex items-center gap-3 text-primary-100/60 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Performance Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="md:col-span-3 p-8 sm:p-10 bg-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-2">Institute Registration</h2>
            <p className="text-slate-400 mb-8">Fill the details to request access</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Institute Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text" name="instituteName" required
                    value={formData.instituteName} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="e.g. NextGen Computer Institute"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Admin Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text" name="adminName" required
                    value={formData.adminName} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="e.g. Sanjay Rajpoot"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email" name="email" required
                      value={formData.email} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder="admin@institute.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="tel" name="phone" required
                      value={formData.phone} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Detailed Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 h-4 w-4 text-slate-500" />
                  <textarea
                    name="address" rows="2"
                    value={formData.address} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Street, City, District..."
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center group disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="animate-pulse">Submitting Request...</span>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <p className="text-center text-slate-500 text-sm mt-4">
                Already have an institute? <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
