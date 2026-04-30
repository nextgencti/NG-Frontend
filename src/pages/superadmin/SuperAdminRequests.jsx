import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, User, MapPin, Calendar } from 'lucide-react';

import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function SuperAdminRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // 1. Handle Firestore Timestamp objects (if using client SDK)
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    
    // 2. Handle serialized Firestore Timestamps (seconds or _seconds)
    const seconds = timestamp.seconds ?? timestamp._seconds;
    if (seconds !== undefined) {
      return new Date(seconds * 1000).toLocaleString();
    }
    
    // 3. Handle standard Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }

    // 4. Handle strings
    if (typeof timestamp === 'string') {
      // Remove "at" and handle common serialization quirks
      let cleanString = timestamp.replace(/\s+at\s+/i, ' ');
      
      // Fix Non-standard UTC+X:XX to UTC+XX:XX for browser parsing
      cleanString = cleanString.replace(/UTC\+(\d):/i, 'UTC+0$1:');
      
      const date = new Date(cleanString);
      if (date.toString() !== 'Invalid Date') {
        return date.toLocaleString();
      }
    }
    
    // 5. Final fallback - attempt direct parse or return original
    try {
      const finalDate = new Date(timestamp);
      return finalDate.toString() !== 'Invalid Date' ? finalDate.toLocaleString() : String(timestamp);
    } catch (e) {
      return String(timestamp);
    }
  };






  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/superadmin/institute-requests');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load registration requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (id) => {
    setApprovingId(id);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!approvingId) return;
    
    setProcessingId(approvingId);
    setShowApproveModal(false);
    try {
      await api.post(`/superadmin/institute-requests/${approvingId}/approve`);
      toast.success('Institute approved and created successfully');
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
      setApprovingId(null);
    }
  };


  const handleReject = (id) => {
    setRejectingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectingId) return;
    
    setProcessingId(rejectingId);
    setShowRejectModal(false);
    try {
      await api.post(`/superadmin/institute-requests/${rejectingId}/reject`, { reason: rejectionReason });
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
      setRejectingId(null);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Registration Requests</h2>
        <p className="text-slate-400">Review and manage new institute registration requests</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Requests ({pendingRequests.length})
        </h3>
        
        {pendingRequests.length === 0 ? (
          <div className="glass-dark p-8 rounded-2xl border border-white/5 text-center">
            <p className="text-slate-500 italic">No pending requests at the moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="glass-dark rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{request.instituteName}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {request.adminName}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {request.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {request.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      {expandedId === request.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {expandedId === request.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Complete Registration Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 font-medium">Institute Information</p>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                             <p className="text-sm text-white font-medium flex items-center gap-2">
                               <Building2 className="w-4 h-4 text-primary-400" /> {request.instituteName}
                             </p>
                             <p className="text-sm text-slate-400 flex items-start gap-2">
                               <MapPin className="w-4 h-4 text-slate-500 mt-0.5" /> 
                               <span className="flex-1">{request.address || 'No address provided'}</span>
                             </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 font-medium">Submission Status</p>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                             <Calendar className="w-4 h-4 text-slate-500" />
                             <p className="text-sm text-slate-300">
                               Applied on {formatDate(request.createdAt)}
                             </p>

                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 font-medium">Administrative Contact</p>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                             <div className="flex items-center gap-3">
                               <User className="w-4 h-4 text-primary-400" />
                               <span className="text-sm text-white">{request.adminName} (Primary Admin)</span>
                             </div>
                             <div className="flex items-center gap-3">
                               <Mail className="w-4 h-4 text-slate-500" />
                               <span className="text-sm text-slate-300">{request.email}</span>
                             </div>
                             <div className="flex items-center gap-3">
                               <Phone className="w-4 h-4 text-slate-500" />
                               <span className="text-sm text-slate-300">{request.phone}</span>
                             </div>
                          </div>
                        </div>

                        <div className="pt-2">
                           <p className="text-xs text-slate-500 mb-2 italic">Note: Approving will create an active institute and admin credentials will be sent to the email provided.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {pastRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-400">Processed Requests</h3>
          <div className="glass-dark rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Institute</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-300">Date Processed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastRequests.map(request => (
                  <tr key={request.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{request.instituteName}</p>
                      <p className="text-xs text-slate-500">{request.adminName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{request.email}</td>
                    <td className="px-6 py-4">
                      {request.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Approved</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400">Rejected</span>
                      )}
                    </td>
                     <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(request.processedAt)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowApproveModal(false)}></div>
          <div className="z-10 w-full max-w-md glass-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 bg-emerald-500/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Approve Institute
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to approve this institute? This action will:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                  Create an active institute in the database
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                  Initialize a new Admin account for the institute
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                  Send login credentials via email automatically
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-white/5 flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
              >
                No, Go Back
              </button>
              <button
                onClick={confirmApprove}
                className="flex-[2] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all"
              >
                Yes, Approve Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}

      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="z-10 w-full max-w-md glass-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 bg-rose-500/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="w-6 h-6 text-rose-500" />
                Reject Request
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-400 text-sm">
                Please provide a reason for rejecting this registration request. This reason will be sent to the institute via email.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete documentation, Invalid contact details..."
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all resize-none"
                  autoFocus
                ></textarea>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionReason.trim()}
                className="flex-[2] py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
