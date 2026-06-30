import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, UserCheck, CreditCard, CheckCircle2, 
  Play, ExternalLink, Briefcase, Shield, Download, FileText, 
  Loader2, Globe, FileCheck, HelpCircle
} from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ng-backend-91oz.onrender.com/api';

// Lightweight Markdown & Table Parser for Rich AI Responses
const renderMarkdown = (text) => {
  if (!text) return null;

  const parseInlineStyles = (txt) => {
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    const splitParts = txt.split(regex);
    
    return splitParts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderTable = (rows) => {
    if (rows.length === 0) return null;
    const headers = rows[0];
    const bodyRows = rows.slice(1);

    return (
      <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-[12px]">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-4 py-2.5 text-left font-black text-slate-700 uppercase tracking-wider">
                  {parseInlineStyles(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2.5 text-slate-600 font-medium">
                    {parseInlineStyles(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let isInsideList = false;
  let currentTable = [];
  let isInsideTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|')) {
      if (isInsideList) {
        elements.push(
          <ul key={`ul-${i}`} className="list-disc pl-5 my-2 space-y-1 text-slate-700">
            {currentList}
          </ul>
        );
        currentList = [];
        isInsideList = false;
      }
      isInsideTable = true;
      if (!line.includes('---')) {
        const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        currentTable.push(cells);
      }
      continue;
    } else if (isInsideTable) {
      elements.push(renderTable(currentTable));
      currentTable = [];
      isInsideTable = false;
    }

    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('***') || (line.startsWith('*') && !line.startsWith('**'))) {
      isInsideList = true;
      let content = line;
      if (line.startsWith('* ')) content = line.slice(2);
      else if (line.startsWith('- ')) content = line.slice(2);
      else if (line.startsWith('***')) content = '**' + line.slice(3);
      else if (line.startsWith('*')) content = line.slice(1);

      currentList.push(
        <li key={`li-${i}`} className="text-[13px] ml-1">
          {parseInlineStyles(content)}
        </li>
      );
      continue;
    } else if (isInsideList) {
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 my-2 space-y-1 text-slate-700">
          {currentList}
        </ul>
      );
      currentList = [];
      isInsideList = false;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h5 key={i} className="text-[13px] font-extrabold mt-3 mb-1 text-slate-900">
          {parseInlineStyles(line.slice(4))}
        </h5>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h4 key={i} className="text-[14px] font-black mt-4 mb-2 text-slate-900">
          {parseInlineStyles(line.slice(3))}
        </h4>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h3 key={i} className="text-[15px] font-black mt-4 mb-2 text-slate-900">
          {parseInlineStyles(line.slice(2))}
        </h3>
      );
    } 
    else if (line === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
    } 
    else {
      elements.push(
        <p key={i} className="text-[13px] leading-relaxed text-slate-700">
          {parseInlineStyles(line)}
        </p>
      );
    }
  }

  if (isInsideTable) {
    elements.push(renderTable(currentTable));
  }
  if (isInsideList) {
    elements.push(
      <ul key="ul-end" className="list-disc pl-5 my-2 space-y-1 text-slate-700">
        {currentList}
      </ul>
    );
  }

  return <div className="space-y-1.5">{elements}</div>;
};

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/public/gov-services/${id}`);
        if (res.data.success) {
          setService(res.data.service);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getCategoryIcon = (category) => {
    const categoryIconMap = {
      'Job Alerts': Briefcase,
      'Identity Cards': Shield,
      'Results & Certs': Download,
      'Welfare & Schemes': FileText
    };
    return categoryIconMap[category] || Briefcase;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">Loading Service Guidelines...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
          <HelpCircle className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-black text-slate-800 mb-2">Service Not Found</h2>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            The service you are looking for might have been deleted, renamed, or is temporarily unavailable.
          </p>
          <button 
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go back to Services
          </button>
        </div>
      </div>
    );
  }

  const ServiceIcon = getCategoryIcon(service.category);
  const ytVideoId = getYoutubeId(service.youtubeUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FAF9FF] to-white overflow-hidden relative selection:bg-indigo-500/10 text-left">
      {/* Top ambient lights */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-white/10 flex items-center justify-center shrink-0">
              <Logo className="w-8 h-8" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center">
                <span className="text-white">Next</span>
                <span className="text-indigo-400 ml-0.5">Gen</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={() => navigate('/services')} 
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Back Link Breadcrumb */}
        <div className="mb-6">
          <Link to="/services" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Services
          </Link>
        </div>

        {/* Hero Section Card */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-xl" />
          
          <div className="relative bg-white/80 backdrop-blur-xl border border-indigo-100/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4.5">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/55 rounded-2xl flex items-center justify-center text-indigo-650 shrink-0 shadow-sm overflow-hidden">
                {service.imageUrl ? (
                  <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                  <ServiceIcon className="w-7 h-7" />
                )}
              </div>
              <div>
                <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-1.5">
                  {service.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                  {service.name}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-2xl">
                  {service.tagline || service.description}
                </p>
              </div>
            </div>

            {service.link && (
              <a 
                href={service.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font- NeueMachina-Medium font-bold text-[13px] tracking-wide shadow-md shadow-indigo-600/10 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                Open Official Portal <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* 3-Column Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Important Dates */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Important Dates</h4>
              <p className="text-[12.5px] font-extrabold text-slate-700 whitespace-pre-line leading-relaxed">
                {service.importantDates || 'TBA (To Be Announced)'}
              </p>
            </div>
          </div>

          {/* Age Limit */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Age Limits</h4>
              <p className="text-[12.5px] font-extrabold text-slate-700 whitespace-pre-line leading-relaxed">
                {service.ageLimit || 'Refer official guidelines'}
              </p>
            </div>
          </div>

          {/* Fees details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Fees Details</h4>
              <p className="text-[12.5px] font-extrabold text-slate-700 whitespace-pre-line leading-relaxed">
                {service.feesDetails || 'No Application Fee'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Layout - 2/3 Main Info & 1/3 Sidebar Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Blocks (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Required Documents Checklist */}
            {service.requiredDocs && service.requiredDocs.length > 0 && (
              <div className="bg-white border border-slate-150 shadow-sm rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  kon-kon se document lagenge (Required Documents Checklist)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {service.requiredDocs.map((doc, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-indigo-50/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-[12.5px] font-semibold text-slate-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step by step Form Fill Guide */}
            {service.formFillGuide && (
              <div className="bg-white border border-slate-150 shadow-sm rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-650" />
                  Form Fill Karne Ka Tareeka (Step-by-Step Guide)
                </h3>
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl overflow-hidden leading-relaxed">
                  {renderMarkdown(service.formFillGuide)}
                </div>
              </div>
            )}

            {/* YouTube Tutorial Embed */}
            {ytVideoId && (
              <div className="bg-white border border-slate-150 shadow-sm rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-rose-600 fill-rose-600/10" />
                  Video Tutorial (YouTube Guide)
                </h3>
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-md border border-slate-200/60 bg-[#0F0C20]">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${ytVideoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links Sidebar (Col span 1) */}
          <div className="space-y-6">
            
            {/* Portals & Important Links Card */}
            <div className="bg-white border border-slate-150 shadow-sm rounded-2xl p-6 text-left">
              <h3 className="text-sm font-bold text-slate-800 mb-4.5 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe className="w-4.5 h-4.5 text-indigo-600" />
                Important Links & Portals
              </h3>
              
              <div className="space-y-3">
                {/* Official link */}
                {service.link && (
                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3.5 bg-indigo-50/55 hover:bg-indigo-50 border border-indigo-100 text-indigo-750 hover:text-indigo-850 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm transition-all"
                  >
                    <span className="font-extrabold truncate">Open Official Portal</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                )}

                {/* Additional Sublinks */}
                {service.sublinks && service.sublinks.map((sublink, idx) => (
                  <a
                    key={idx}
                    href={sublink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-indigo-700 rounded-xl font-semibold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="truncate">{sublink.label}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
                  </a>
                ))}

                {(!service.link && (!service.sublinks || service.sublinks.length === 0)) && (
                  <p className="text-slate-400 text-xs italic text-center py-4">No links listed for this service.</p>
                )}
              </div>
            </div>

            {/* Quick Support / Disclaimer */}
            <div className="bg-[#0F0C20] text-slate-300 rounded-2xl p-5 border border-indigo-950 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-400 mb-2">NextGen Support</h4>
              <p className="text-[11px] leading-relaxed text-slate-400 font-semibold mb-3">
                अगर आपको इस सर्विस का फॉर्म भरने में कोई परेशानी आ रही है, तो आप अपने छात्र पोर्टल से **Sanju AI** से तुरंत लाइव मदद ले सकते हैं!
              </p>
              <Link 
                to="/dashboard/ai-tutor" 
                className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
              >
                Ask Sanju AI <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
